import express from "express";
import {
  createNote,
  deleteNode,
  getNode,
  getNotes,
  getNotesIdAndVersion,
  updateNote,
} from "../controllers/note_controller.js";
import { verifyToken } from "../middleware/middleware.js";

const router = express.Router();

router.get("/getNotes", verifyToken, getNotes);
router.get("/getNotesIdAndVersion", verifyToken, getNotesIdAndVersion);
router.post("/create", verifyToken, createNote);
router.delete("/:noteId", verifyToken, deleteNode);
router.post("/update", verifyToken, updateNote);
router.get("/:noteId", verifyToken, getNode);

export default router;
