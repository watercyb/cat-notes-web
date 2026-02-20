import Note from "../models/note.model.js";
import User from "../models/user_model.js";

export const getNotes = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - User not found" });

    const user = await User.findById(userId).populate("notes");

    res.status(200).json({
      success: true,
      notes: user.notes,
    });
  } catch (error) {
    console.log("Error in getNotes: ", error.message);
    res.status(500).json({ success: false, message: "Server internal error" });
  }
};

export const createNote = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - User not found" });

    const { title, content, version } = req.body;
    if (title === null) title = "";
    if (!content || version === undefined)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });

    const note = await Note.create({
      title,
      content,
      version,
    });

    await User.findByIdAndUpdate(
      userId,
      { $push: { notes: note._id } },
      { new: true },
    );

    res.status(201).json({
      success: true,
      note,
    });
  } catch (error) {
    console.log("Error in createNote: ", error.message);
    res.status(500).json({ success: false, message: "Server internal error" });
  }
};

export const deleteNode = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - User not found" });

    const { noteId } = req.params;
    if (
      !noteId ||
      !user.notes.some((id) => id.toString() === noteId.toString())
    )
      return res
        .status(400)
        .json({ success: false, message: "Invalid note id" });

    await User.findByIdAndUpdate(
      user._id,
      { $pull: { notes: noteId } },
      { new: true },
    );

    await Note.findByIdAndDelete(noteId);

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log("Error in deleteNode: ", error.message);
    res.status(500).json({ success: false, message: "Server internal error" });
  }
};

export const updateNote = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - User not found" });

    const { noteId, title, content, version } = req.body;
    if (
      !noteId ||
      !user.notes.some((id) => id.toString() === noteId.toString())
    )
      return res
        .status(400)
        .json({ success: false, message: "Invalid note id" });
    if (title === null) title = "";
    if (!content || version === undefined)
      return res
        .status(400)
        .json({ success: false, message: "Please input update field" });

    const note = await Note.findByIdAndUpdate(
      noteId,
      { title, content, version },
      {
        new: true,
      },
    );

    if (!note) return res.status(404).json({ message: "Note not found" });

    res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    console.log("Error in deleteNode: ", error.message);
    res.status(500).json({ success: false, message: "Server internal error" });
  }
};
