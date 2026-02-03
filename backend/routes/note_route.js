import express from "express";
import { createNote, deleteNode, getNotes, updateNote } from "../controllers/note_controller.js";
import { verifyToken } from "../middleware/middleware.js";

const router = express.Router();

router.get("/getNotes", verifyToken, getNotes);
router.post("/create", verifyToken, createNote);
router.delete("/:noteId", verifyToken, deleteNode);
router.post("/update", verifyToken, updateNote);

export default router;
