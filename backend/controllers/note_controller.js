import Note from "../models/note_model.js";
import User from "../models/user_model.js";

export const getNotes = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const user = await User.findById(userId).populate("notes");

    res.status(200).json({
      success: true,
      notes: user.notes,
    });
  } catch (error) {
    console.error("Error in getNotes: ", error.message);
    res.status(500).json({ success: false, message: "Server internal error" });
  }
};

export const getNotesIdAndVersion = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const user = await User.findById(userId).populate("notes");

    const list = user.notes.map((note) => ({
      _id: note._id,
      version: note.version,
    }));

    res.status(200).json({
      success: true,
      notes: list,
    });
  } catch (error) {
    console.error("Error in getNotesIdAndVersion: ", error.message);
    res.status(500).json({ success: false, message: "Server internal error" });
  }
};

export const createNote = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    let { title, content, version, isEncrypted } = req.body;
    if (title === null) title = "";
    if (content === null) content = "";
    if (version === undefined)
      return res
        .status(422)
        .json({ success: false, message: "All fields are required" });
    if (isEncrypted === undefined) isEncrypted = false;

    const note = await Note.create({
      title,
      content,
      version,
      isEncrypted,
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
    console.error("Error in createNote: ", error.message);
    res.status(500).json({ success: false, message: "Server internal error" });
  }
};

export const deleteNode = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const { noteId } = req.params;
    if (
      !noteId ||
      !user.notes.some((id) => id.toString() === noteId.toString())
    )
      return res.status(200).json({
        success: true,
      });

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
    console.error("Error in deleteNode: ", error.message);
    res.status(500).json({ success: false, message: "Server internal error" });
  }
};

export const updateNote = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    let { noteId, title, content, version, isEncrypted } = req.body;
    if (
      !noteId ||
      !user.notes.some((id) => id.toString() === noteId.toString())
    )
      return res
        .status(403)
        .json({ success: false, message: "Invalid note id" });
    if (title === null) title = "";
    if (content === null) content = "";
    if (version === undefined || isEncrypted === undefined)
      return res
        .status(422)
        .json({ success: false, message: "All fields are required" });

    let note = await Note.findById(noteId);

    if (!note) return res.status(403).json({ message: "Note not found" });

    if (note.version < version) {
      note.title = title;
      note.content = content;
      note.version = version;

      await note.save();

      res.status(200).json({
        success: true,
        note,
      });
    } else if (
      note.version > version ||
      (note.title == title && note.content == content)
    ) {
      res.status(200).json({
        success: true,
        note,
      });
    } else {
      const newNote = await Note.create({
        title,
        content,
        version,
        isEncrypted,
      });

      await User.findByIdAndUpdate(
        user._id,
        { $push: { notes: newNote._id } },
        { new: true },
      );

      res.status(200).json({
        success: false,
        noteFromServer: note,
        newNote,
      });
    }
  } catch (error) {
    console.error("Error in deleteNode: ", error.message);
    res.status(500).json({ success: false, message: "Server internal error" });
  }
};

export const getNode = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const { noteId } = req.params;
    if (
      !noteId ||
      !user.notes.some((id) => id.toString() === noteId.toString())
    )
      return res
        .status(403)
        .json({ success: false, message: "Invalid note id" });

    const note = await Note.findById(noteId);

    res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    console.error("Error in getNode: ", error.message);
    res.status(500).json({ success: false, message: "Server internal error" });
  }
};
