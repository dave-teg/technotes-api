import User from "../models/User.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import Note from "../models/Note.js";
import mongoose from "mongoose";

//@desc Get all users
//@route GET /users
//access Private
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users?.length) {
    return res.json({ message: "No users found" });
  }
  res.json(users);
});

//@desc create new user
//@route POST /users
//access Private
export const createUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  //check for duplicate -> the collation make the check case insensitive
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  //hash password
  const hashedPassword = await bcrypt.hash(password, 10); // salt rounds

  const userObject =
    !Array.isArray(roles) || !roles.length
      ? { username, password: hashedPassword }
      : { username, password: hashedPassword, roles };

  const user = await User.create(userObject);

  if (user) {
    res.status(201).json({ message: `New User ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received." });
  }
});

//@desc update a user
//@route PATCH /users
//access Private
export const updateUser = asyncHandler(async (req, res) => {
  const { id, username, password, roles, active } = req.body;

  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  //check if the user id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  //check for duplicates case insensitively
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  if (duplicate && duplicate._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    //hash the password
    user.password = await bcrypt.hash(password, 10); //salt rounds
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
});

//@desc delete a user
//@route DELETE /users
//access Private
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Id is required" });
  }

  //check if the user id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  //check if the user has notes assigned to them because if they have the user can't be deleted
  const note = await Note.findOne({ user: id }).lean().exec();
  if (note) {
    return res.status(400).json({
        message:
          "User can't be deleted because they have notes assigned to them",
      });
  }

  // check if user exists
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await user.deleteOne();

  res.json({message: `Username ${user?.username} with id ${user?.id} deleted`});
});
