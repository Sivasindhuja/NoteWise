import express from "express";
import { createNote, readAllNotes, readNote, updateNote, deleteNote } from "../controllers/noteController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/", createNote);
router.get("/", readAllNotes);
router.get("/:noteId", readNote);
router.put("/:noteId", updateNote);
router.patch("/:noteId", updateNote);
router.delete("/:noteId", deleteNote);

export default router;
