import Note from "../models/note.model.js";
import User from "../models/user_model.js";

export const cleanup = async () => {
  const existingNoteIds = await Note.distinct("_id");
  await User.updateMany({}, { $pull: { notes: { $nin: existingNoteIds } } });

  const users = await User.find({}).select("notes").lean();
  const noteIds = [...new Set(users.flatMap((u) => u.notes))];
  await Note.deleteMany({_id: { $nin: noteIds }});
};
