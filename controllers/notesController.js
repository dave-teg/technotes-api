import Note from "../models/Note.js";
import User from "../models/User.js"
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

//@desc get all notes
//@route GET /notes
//@access Private
export const getAllNotes = asyncHandler( async(req, res) => {
  const notes = await Note.find().lean()
  if(!notes?.length) {
    return res.json({message: "No notes found"})
  }
  
  //add username for each note before sending
  const notesWithUser = await Promise.all(notes.map( async (note) => {
    const user = await User.findById(note.user).lean().exec()
    return {...note, username: user.username}
  }))
  console.log(notesWithUser)

  res.json(notesWithUser)
})

//@desc create new note
//@route POST /notes
//@access Private
export const createNote = asyncHandler( async(req, res) => {
  const {userId, title, text} = req.body;

  if(!userId || !title || !text) {
    return res.status(400).json({message: "All fields are required"})
  }

  //check if id is valid
  if(!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({message: "Invalid user ID format"})
  }

  const user = await User.findById(userId).lean().exec()

  if(!user) {
    return res.status(404).json({message: "User not found"})
  }

  //check if title is duplicate
  const duplicate = await Note.findOne({title}).collation({locale: 'en', strength: 2}).lean().exec()
  if(duplicate) {
    return res.status(409).json({message: "Duplicate title"})
  }

  const noteObject = {
    user: userId,
    title,
    text
  }

  const note = await Note.create(noteObject)

  if(note) {
    res.status(201).json({message: "New Note created", note})
  } else {
    res.status(400).json({message: "Invalid note data received"})
  }
})

//@desc update note
//@route PATCH /notes
//@access Private
export const updateNote = asyncHandler( async(req, res) => {
  const {id, title, text, completed, userId} = req.body

  if(!id || !userId || !title || !text || typeof completed !== 'boolean') {
    return res.status(400).json({message: "All fields are required"})
  }

  //check if id is valid
  if(!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({message: "Invalid note ID format"})
  }

  const note = await Note.findById(id).exec()

  //check if the note exists
  if(!note) {
    return res.status(404).json({message: "Note not found"})
  }

  //check if id is valid
  if(!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({message: "Invalid user ID format"})
  }

  const user = await User.findById(userId).lean().exec()

  //check if user exists
  if(!user) {
    return res.status(404).json({message: "The user assigned to the notes was not found"})
  }

  //check if the title is duplicate
  const duplicate = await Note.findOne({title}).collation({locale: 'en', strength: 2}).lean().exec()
  if(duplicate && duplicate._id.toString() !== id) {
    return res.status(409).json({message: "Duplicate title"})
  }

  note.user = userId
  note.title = title;
  note.text = text;
  note.completed = completed;

  const updatedNote = await note.save();

  res.json({message: `Note titled '${updatedNote.title}' updated`, updatedNote})
})

//@desc delete Note
//@route DELETE /notes
//@access Private
export const deleteNote = asyncHandler( async(req, res) => {
  const {id} = req.body;

  if(!id) {
    return res.status(400).json({message: "Id is required"})
  }

  //check if id is valid
  if(!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({message: "Invalid user ID format"})
  }

  const note = await Note.findById(id).exec()

  if(!note) {
    return res.status(404).json({message: "Note not found"})
  }

  await note.deleteOne()

  res.json({message: `Note with id ${id} deleted`})
})