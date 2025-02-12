import { Router } from "express";
import { getAllNotes, createNote, updateNote, deleteNote } from "../controllers/notesController.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = Router()

router.use(verifyJWT)

router.route("/")
      .get(getAllNotes)
      .post(createNote)
      .patch(updateNote)
      .delete(deleteNote)

export default router