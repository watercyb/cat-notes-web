import {
  describe,
  it,
  vi,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";
import mongoose from "mongoose";
import Note from "../../models/note_model.js";
import User from "../../models/user_model.js";

import {
  getNotes,
  getNotesIdAndVersion,
  createNote,
  deleteNode,
  updateNote,
  getNode,
} from "../../controllers/note_controller.js";

import dotenv from "dotenv";

dotenv.config({ quiet: true });

vi.mock("node-cron", () => ({
  schedule: vi.fn(),
}));

describe("Note Controller Integration Tests", () => {
  let user;

  let consoleLogSpy;
  let consoleErrorSpy;

  // Simple mock response object
  const createRes = () => {
    const res = {};

    res.status = (statusCode) => {
      res.statusCode = statusCode;
      return res;
    };

    res.json = (data) => {
      res.body = data;
      return res;
    };

    return res;
  };

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST);
  });

  beforeEach(async () => {
    await Note.deleteMany({});
    await User.deleteMany({});

    user = await User.create({
      email: "note-test@example.com",
      name: "note-test-user",
      password: "11111111",
    });

    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(async () => {
    await Note.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  // -------------------------------------------------------
  // getNotes
  // -------------------------------------------------------

  describe("getNotes", () => {
    it("should return all notes belonging to the user", async () => {
      const note1 = await Note.create({
        title: "Note 1",
        content: "Content 1",
        version: 1,
        isEncrypted: false,
      });

      const note2 = await Note.create({
        title: "Note 2",
        content: "Content 2",
        version: 2,
        isEncrypted: true,
      });

      user.notes.push(note1._id, note2._id);
      await user.save();

      const req = {
        user: {
          _id: user._id,
        },
      };

      const res = createRes();

      await getNotes(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.notes).toHaveLength(2);

      expect(res.body.notes[0]._id.toString()).toBe(note1._id.toString());
      expect(res.body.notes[1]._id.toString()).toBe(note2._id.toString());
    });

    it("should return 401 when user id is missing", async () => {
      const req = {
        user: {},
      };

      const res = createRes();

      await getNotes(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid credentials",
      });
    });
  });

  // -------------------------------------------------------
  // getNotesIdAndVersion
  // -------------------------------------------------------

  describe("getNotesIdAndVersion", () => {
    it("should return note ids and versions", async () => {
      const note1 = await Note.create({
        title: "Note 1",
        content: "Content 1",
        version: 3,
        isEncrypted: false,
      });

      const note2 = await Note.create({
        title: "Note 2",
        content: "Content 2",
        version: 7,
        isEncrypted: true,
      });

      user.notes.push(note1._id, note2._id);
      await user.save();

      const req = {
        user: {
          _id: user._id,
        },
      };

      const res = createRes();

      await getNotesIdAndVersion(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      expect(res.body.notes).toHaveLength(2);

      expect(res.body.notes[0]._id.toString()).toBe(note1._id.toString());
      expect(res.body.notes[0].version).toBe(3);

      expect(res.body.notes[1]._id.toString()).toBe(note2._id.toString());
      expect(res.body.notes[1].version).toBe(7);
    });

    it("should return 401 when user id is missing", async () => {
      const req = {
        user: {},
      };

      const res = createRes();

      await getNotesIdAndVersion(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid credentials",
      });
    });
  });

  // -------------------------------------------------------
  // createNote
  // -------------------------------------------------------

  describe("createNote", () => {
    it("should create a note and add it to the user's notes", async () => {
      const req = {
        user: {
          _id: user._id,
        },
        body: {
          title: "Test Note",
          content: "Hello World",
          version: 1,
          isEncrypted: false,
        },
      };

      const res = createRes();

      await createNote(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);

      expect(res.body.note.title).toBe("Test Note");
      expect(res.body.note.content).toBe("Hello World");
      expect(res.body.note.version).toBe(1);
      expect(res.body.note.isEncrypted).toBe(false);

      // Verify note actually exists in DB
      const savedNote = await Note.findById(res.body.note._id);

      expect(savedNote).not.toBeNull();
      expect(savedNote.title).toBe("Test Note");

      // Verify user actually references the note
      const updatedUser = await User.findById(user._id);

      expect(updatedUser.notes).toHaveLength(1);
      expect(updatedUser.notes[0].toString()).toBe(savedNote._id.toString());
    });

    it("should use empty strings when title and content are null", async () => {
      const req = {
        user: {
          _id: user._id,
        },
        body: {
          title: null,
          content: null,
          version: 1,
          isEncrypted: false,
        },
      };

      const res = createRes();

      await createNote(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.note.title).toBe("");
      expect(res.body.note.content).toBe("");
    });

    it("should default isEncrypted to false", async () => {
      const req = {
        user: {
          _id: user._id,
        },
        body: {
          title: "Test",
          content: "Content",
          version: 1,
        },
      };

      const res = createRes();

      await createNote(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.body.note.isEncrypted).toBe(false);
    });

    it("should return 422 when version is missing", async () => {
      const req = {
        user: {
          _id: user._id,
        },
        body: {
          title: "Test",
          content: "Content",
        },
      };

      const res = createRes();

      await createNote(req, res);

      expect(res.statusCode).toBe(422);
      expect(res.body).toEqual({
        success: false,
        message: "All fields are required",
      });
    });

    it("should return 401 when user id is missing", async () => {
      const req = {
        user: {},
        body: {
          title: "Test",
          content: "Content",
          version: 1,
        },
      };

      const res = createRes();

      await createNote(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid credentials",
      });
    });
  });

  // -------------------------------------------------------
  // deleteNode
  // -------------------------------------------------------

  describe("deleteNode", () => {
    it("should delete the note and remove it from the user", async () => {
      const note = await Note.create({
        title: "Delete Me",
        content: "Content",
        version: 1,
        isEncrypted: false,
      });

      user.notes.push(note._id);
      await user.save();

      const req = {
        user: await User.findById(user._id),
        params: {
          noteId: note._id.toString(),
        },
      };

      const res = createRes();

      await deleteNode(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
      });

      // Verify note was deleted
      const deletedNote = await Note.findById(note._id);
      expect(deletedNote).toBeNull();

      // Verify note was removed from user
      const updatedUser = await User.findById(user._id);

      expect(updatedUser.notes).toHaveLength(0);
    });

    it("should return success without deleting anything when note does not belong to user", async () => {
      const note = await Note.create({
        title: "Other Note",
        content: "Content",
        version: 1,
        isEncrypted: false,
      });

      const req = {
        user: await User.findById(user._id),
        params: {
          noteId: note._id.toString(),
        },
      };

      const res = createRes();

      await deleteNode(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
      });

      // Note should still exist
      const existingNote = await Note.findById(note._id);
      expect(existingNote).not.toBeNull();
    });

    it("should return 401 when user is missing", async () => {
      const req = {
        params: {
          noteId: new mongoose.Types.ObjectId().toString(),
        },
      };

      const res = createRes();

      await deleteNode(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid credentials",
      });
    });
  });

  // -------------------------------------------------------
  // updateNote
  // -------------------------------------------------------

  describe("updateNote", () => {
    it("should update the existing note when the new version is higher", async () => {
      const note = await Note.create({
        title: "Old Title",
        content: "Old Content",
        version: 1,
        isEncrypted: false,
      });

      user.notes.push(note._id);
      await user.save();

      const req = {
        user: await User.findById(user._id),
        body: {
          noteId: note._id.toString(),
          title: "New Title",
          content: "New Content",
          version: 2,
          isEncrypted: false,
        },
      };

      const res = createRes();

      await updateNote(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      expect(res.body.note.title).toBe("New Title");
      expect(res.body.note.content).toBe("New Content");
      expect(res.body.note.version).toBe(2);

      // Verify DB
      const updatedNote = await Note.findById(note._id);

      expect(updatedNote.title).toBe("New Title");
      expect(updatedNote.content).toBe("New Content");
      expect(updatedNote.version).toBe(2);
    });

    it("should return the existing note when the new version is older", async () => {
      const note = await Note.create({
        title: "Server Title",
        content: "Server Content",
        version: 5,
        isEncrypted: false,
      });

      user.notes.push(note._id);
      await user.save();

      const req = {
        user: await User.findById(user._id),
        body: {
          noteId: note._id.toString(),
          title: "Old Title",
          content: "Old Content",
          version: 3,
          isEncrypted: false,
        },
      };

      const res = createRes();

      await updateNote(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      expect(res.body.note._id.toString()).toBe(note._id.toString());
      expect(res.body.note.version).toBe(5);
      expect(res.body.note.title).toBe("Server Title");
    });

    it("should return the existing note when title and content are unchanged", async () => {
      const note = await Note.create({
        title: "Same Title",
        content: "Same Content",
        version: 5,
        isEncrypted: false,
      });

      user.notes.push(note._id);
      await user.save();

      const req = {
        user: await User.findById(user._id),
        body: {
          noteId: note._id.toString(),
          title: "Same Title",
          content: "Same Content",
          version: 5,
          isEncrypted: false,
        },
      };

      const res = createRes();

      await updateNote(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.note._id.toString()).toBe(note._id.toString());
    });

    it("should create a new note when versions are equal but content is different", async () => {
      const note = await Note.create({
        title: "Server Title",
        content: "Server Content",
        version: 5,
        isEncrypted: false,
      });

      user.notes.push(note._id);
      await user.save();

      const req = {
        user: await User.findById(user._id),
        body: {
          noteId: note._id.toString(),
          title: "Client Title",
          content: "Client Content",
          version: 5,
          isEncrypted: true,
        },
      };

      const res = createRes();

      await updateNote(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(false);

      expect(res.body.noteFromServer._id.toString()).toBe(note._id.toString());

      expect(res.body.newNote).toBeDefined();
      expect(res.body.newNote.title).toBe("Client Title");
      expect(res.body.newNote.content).toBe("Client Content");
      expect(res.body.newNote.version).toBe(5);
      expect(res.body.newNote.isEncrypted).toBe(true);

      // Verify two notes now exist
      const notes = await Note.find({});

      expect(notes).toHaveLength(2);

      // Verify new note was added to user
      const updatedUser = await User.findById(user._id);

      expect(updatedUser.notes).toHaveLength(2);
    });

    it("should return 403 when note does not belong to user", async () => {
      const note = await Note.create({
        title: "Other User Note",
        content: "Content",
        version: 1,
        isEncrypted: false,
      });

      const req = {
        user: await User.findById(user._id),
        body: {
          noteId: note._id.toString(),
          title: "Updated",
          content: "Updated",
          version: 2,
          isEncrypted: false,
        },
      };

      const res = createRes();

      await updateNote(req, res);

      expect(res.statusCode).toBe(403);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid note id",
      });

      // Verify note wasn't changed
      const unchangedNote = await Note.findById(note._id);

      expect(unchangedNote.title).toBe("Other User Note");
      expect(unchangedNote.version).toBe(1);
    });

    it("should return 422 when version is missing", async () => {
      const note = await Note.create({
        title: "Title",
        content: "Content",
        version: 1,
        isEncrypted: false,
      });

      user.notes.push(note._id);
      await user.save();

      const req = {
        user: await User.findById(user._id),
        body: {
          noteId: note._id.toString(),
          title: "Updated",
          content: "Updated",
          isEncrypted: false,
        },
      };

      const res = createRes();

      await updateNote(req, res);

      expect(res.statusCode).toBe(422);
      expect(res.body).toEqual({
        success: false,
        message: "All fields are required",
      });
    });

    it("should return 422 when isEncrypted is missing", async () => {
      const note = await Note.create({
        title: "Title",
        content: "Content",
        version: 1,
        isEncrypted: false,
      });

      user.notes.push(note._id);
      await user.save();

      const req = {
        user: await User.findById(user._id),
        body: {
          noteId: note._id.toString(),
          title: "Updated",
          content: "Updated",
          version: 2,
        },
      };

      const res = createRes();

      await updateNote(req, res);

      expect(res.statusCode).toBe(422);
      expect(res.body).toEqual({
        success: false,
        message: "All fields are required",
      });
    });

    it("should return 403 when note does not exist", async () => {
      const noteId = new mongoose.Types.ObjectId();

      user.notes.push(noteId);
      await user.save();

      const req = {
        user: await User.findById(user._id),
        body: {
          noteId: noteId.toString(),
          title: "Updated",
          content: "Updated",
          version: 2,
          isEncrypted: false,
        },
      };

      const res = createRes();

      await updateNote(req, res);

      expect(res.statusCode).toBe(403);
      expect(res.body).toEqual({
        message: "Note not found",
      });
    });

    it("should convert null title and content to empty strings", async () => {
      const note = await Note.create({
        title: "Old",
        content: "Old",
        version: 1,
        isEncrypted: false,
      });

      user.notes.push(note._id);
      await user.save();

      const req = {
        user: await User.findById(user._id),
        body: {
          noteId: note._id.toString(),
          title: null,
          content: null,
          version: 2,
          isEncrypted: false,
        },
      };

      const res = createRes();

      await updateNote(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.note.title).toBe("");
      expect(res.body.note.content).toBe("");
    });
  });

  // -------------------------------------------------------
  // getNode
  // -------------------------------------------------------

  describe("getNode", () => {
    it("should return the requested note", async () => {
      const note = await Note.create({
        title: "Test Note",
        content: "Test Content",
        version: 3,
        isEncrypted: true,
      });

      user.notes.push(note._id);
      await user.save();

      const req = {
        user: await User.findById(user._id),
        params: {
          noteId: note._id.toString(),
        },
      };

      const res = createRes();

      await getNode(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      expect(res.body.note._id.toString()).toBe(note._id.toString());
      expect(res.body.note.title).toBe("Test Note");
      expect(res.body.note.content).toBe("Test Content");
      expect(res.body.note.version).toBe(3);
      expect(res.body.note.isEncrypted).toBe(true);
    });

    it("should return 403 when note does not belong to user", async () => {
      const note = await Note.create({
        title: "Other Note",
        content: "Content",
        version: 1,
        isEncrypted: false,
      });

      const req = {
        user: await User.findById(user._id),
        params: {
          noteId: note._id.toString(),
        },
      };

      const res = createRes();

      await getNode(req, res);

      expect(res.statusCode).toBe(403);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid note id",
      });
    });

    it("should return 401 when user is missing", async () => {
      const req = {
        params: {
          noteId: new mongoose.Types.ObjectId().toString(),
        },
      };

      const res = createRes();

      await getNode(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid credentials",
      });
    });
  });
});
