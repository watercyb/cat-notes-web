import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

import {
  getNotes,
  getNotesIdAndVersion,
  createNote,
  deleteNode,
  updateNote,
  getNode,
} from "../../../controllers/note_controller.js";

import User from "../../../models/user_model.js";
import Note from "../../../models/note_model.js";

vi.mock("../../../models/user_model.js", () => ({
  default: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock("../../../models/note_model.js", () => ({
  default: {
    create: vi.fn(),
    findById: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

describe("note_controller", () => {
  let req;
  let res;

  let consoleLogSpy;
  let consoleErrorSpy;
  
  beforeEach(() => {
    req = {
      user: {
        _id: "69fc09ea2e406a70e91221b8",
        notes: ["note123", "note456"],
      },
      body: {},
      params: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    vi.clearAllMocks();
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  // ============================================================
  // getNotes
  // ============================================================

  describe("getNotes", () => {
    it("should return user's notes successfully", async () => {
      const notes = [
        {
          _id: "note123",
          title: "Note 1",
          content: "Hello",
        },
        {
          _id: "note456",
          title: "Note 2",
          content: "World",
        },
      ];

      const user = {
        _id: req.user._id,
        notes,
      };

      User.findById.mockReturnValue({
        populate: vi.fn().mockResolvedValue(user),
      });

      await getNotes(req, res);

      expect(User.findById).toHaveBeenCalledWith(req.user._id);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        notes,
      });
    });

    it("should return 401 when user id is missing", async () => {
      req.user = {};

      await getNotes(req, res);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid credentials",
      });

      expect(User.findById).not.toHaveBeenCalled();
    });

    it("should return 500 when database operation fails", async () => {
      User.findById.mockImplementation(() => {
        throw new Error("Database error");
      });

      await getNotes(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server internal error",
      });
    });
  });

  // ============================================================
  // getNotesIdAndVersion
  // ============================================================

  describe("getNotesIdAndVersion", () => {
    it("should return note ids and versions successfully", async () => {
      const notes = [
        {
          _id: "note123",
          version: 1,
          title: "Note 1",
        },
        {
          _id: "note456",
          version: 5,
          title: "Note 2",
        },
      ];

      const user = {
        _id: req.user._id,
        notes,
      };

      User.findById.mockReturnValue({
        populate: vi.fn().mockResolvedValue(user),
      });

      await getNotesIdAndVersion(req, res);

      expect(User.findById).toHaveBeenCalledWith(req.user._id);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        notes: [
          {
            _id: "note123",
            version: 1,
          },
          {
            _id: "note456",
            version: 5,
          },
        ],
      });
    });

    it("should return 401 when user id is missing", async () => {
      req.user = {};

      await getNotesIdAndVersion(req, res);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid credentials",
      });

      expect(User.findById).not.toHaveBeenCalled();
    });

    it("should return 500 when database operation fails", async () => {
      User.findById.mockImplementation(() => {
        throw new Error("Database error");
      });

      await getNotesIdAndVersion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server internal error",
      });
    });
  });

  // ============================================================
  // createNote
  // ============================================================

  describe("createNote", () => {
    beforeEach(() => {
      req.body = {
        title: "Test Note",
        content: "Hello World",
        version: 1,
        isEncrypted: false,
      };
    });

    it("should create a note successfully", async () => {
      const note = {
        _id: "note123",
        title: "Test Note",
        content: "Hello World",
        version: 1,
        isEncrypted: false,
      };

      Note.create.mockResolvedValue(note);
      User.findByIdAndUpdate.mockResolvedValue({});

      await createNote(req, res);

      expect(Note.create).toHaveBeenCalledWith({
        title: "Test Note",
        content: "Hello World",
        version: 1,
        isEncrypted: false,
      });

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        req.user._id,
        { $push: { notes: "note123" } },
      );

      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        note,
      });
    });

    it("should return 401 when user id is missing", async () => {
      req.user = {};

      await createNote(req, res);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid credentials",
      });

      expect(Note.create).not.toHaveBeenCalled();
    });

    it("should return 422 when version is missing", async () => {
      delete req.body.version;

      await createNote(req, res);

      expect(res.status).toHaveBeenCalledWith(422);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "All fields are required",
      });

      expect(Note.create).not.toHaveBeenCalled();
    });

    it("should convert null title and content to empty strings", async () => {
      req.body.title = null;
      req.body.content = null;

      const note = {
        _id: "note123",
        title: "",
        content: "",
        version: 1,
        isEncrypted: false,
      };

      Note.create.mockResolvedValue(note);
      User.findByIdAndUpdate.mockResolvedValue({});

      await createNote(req, res);

      expect(Note.create).toHaveBeenCalledWith({
        title: "",
        content: "",
        version: 1,
        isEncrypted: false,
      });
    });

    it("should default isEncrypted to false", async () => {
      delete req.body.isEncrypted;

      const note = {
        _id: "note123",
        title: "Test Note",
        content: "Hello World",
        version: 1,
        isEncrypted: false,
      };

      Note.create.mockResolvedValue(note);
      User.findByIdAndUpdate.mockResolvedValue({});

      await createNote(req, res);

      expect(Note.create).toHaveBeenCalledWith({
        title: "Test Note",
        content: "Hello World",
        version: 1,
        isEncrypted: false,
      });
    });

    it("should return 500 when database operation fails", async () => {
      Note.create.mockRejectedValue(new Error("Database error"));

      await createNote(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server internal error",
      });
    });
  });

  // ============================================================
  // deleteNode
  // ============================================================

  describe("deleteNode", () => {
    it("should delete a note successfully", async () => {
      req.params.noteId = "note123";

      User.findByIdAndUpdate.mockResolvedValue({});
      Note.findByIdAndDelete.mockResolvedValue({});

      await deleteNode(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        req.user._id,
        { $pull: { notes: "note123" } },
      );

      expect(Note.findByIdAndDelete).toHaveBeenCalledWith("note123");

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
      });
    });

    it("should return 401 when user is missing", async () => {
      req.user = null;

      await deleteNode(req, res);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid credentials",
      });

      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(Note.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it("should return success without deleting when note id is missing", async () => {
      req.params.noteId = undefined;

      await deleteNode(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
      });

      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(Note.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it("should return success without deleting a note that does not belong to the user", async () => {
      req.params.noteId = "note999";

      await deleteNode(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
      });

      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(Note.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it("should return 500 when database operation fails", async () => {
      req.params.noteId = "note123";

      User.findByIdAndUpdate.mockRejectedValue(new Error("Database error"));

      await deleteNode(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server internal error",
      });
    });
  });

  // ============================================================
  // updateNote
  // ============================================================

  describe("updateNote", () => {
    beforeEach(() => {
      req.body = {
        noteId: "note123",
        title: "Updated Note",
        content: "Updated Content",
        version: 2,
        isEncrypted: false,
      };
    });

    it("should return 401 when user is missing", async () => {
      req.user = null;

      await updateNote(req, res);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid credentials",
      });
    });

    it("should return 403 for an invalid note id", async () => {
      req.body.noteId = "note999";

      await updateNote(req, res);

      expect(res.status).toHaveBeenCalledWith(403);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid note id",
      });

      expect(Note.findById).not.toHaveBeenCalled();
    });

    it("should return 422 when version is missing", async () => {
      delete req.body.version;

      await updateNote(req, res);

      expect(res.status).toHaveBeenCalledWith(422);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "All fields are required",
      });
    });

    it("should return 422 when isEncrypted is missing", async () => {
      delete req.body.isEncrypted;

      await updateNote(req, res);

      expect(res.status).toHaveBeenCalledWith(422);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "All fields are required",
      });
    });

    it("should return 403 when note does not exist", async () => {
      Note.findById.mockResolvedValue(null);

      await updateNote(req, res);

      expect(Note.findById).toHaveBeenCalledWith("note123");

      expect(res.status).toHaveBeenCalledWith(403);

      expect(res.json).toHaveBeenCalledWith({
        message: "Note not found",
      });
    });

    it("should update the existing note when client version is newer", async () => {
      const note = {
        _id: "note123",
        title: "Old Title",
        content: "Old Content",
        version: 1,
        isEncrypted: false,
        save: vi.fn().mockResolvedValue(undefined),
      };

      Note.findById.mockResolvedValue(note);

      await updateNote(req, res);

      expect(note.title).toBe("Updated Note");
      expect(note.content).toBe("Updated Content");
      expect(note.version).toBe(2);

      expect(note.save).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        note,
      });

      expect(Note.create).not.toHaveBeenCalled();
    });

    it("should return the server note when server version is newer", async () => {
      const note = {
        _id: "note123",
        title: "Server Title",
        content: "Server Content",
        version: 5,
        isEncrypted: false,
      };

      req.body.version = 3;

      Note.findById.mockResolvedValue(note);

      await updateNote(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        note,
      });

      expect(Note.create).not.toHaveBeenCalled();
    });

    it("should return the existing note when version and content are the same", async () => {
      const note = {
        _id: "note123",
        title: "Updated Note",
        content: "Updated Content",
        version: 2,
        isEncrypted: false,
      };

      Note.findById.mockResolvedValue(note);

      await updateNote(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        note,
      });

      expect(Note.create).not.toHaveBeenCalled();
    });

    it("should create a new note when version is the same but content differs", async () => {
      const serverNote = {
        _id: "note123",
        title: "Server Title",
        content: "Server Content",
        version: 2,
        isEncrypted: false,
      };

      const newNote = {
        _id: "note456",
        title: "Updated Note",
        content: "Updated Content",
        version: 2,
        isEncrypted: false,
      };

      Note.findById.mockResolvedValue(serverNote);
      Note.create.mockResolvedValue(newNote);
      User.findByIdAndUpdate.mockResolvedValue({});

      await updateNote(req, res);

      expect(Note.create).toHaveBeenCalledWith({
        title: "Updated Note",
        content: "Updated Content",
        version: 2,
        isEncrypted: false,
      });

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        req.user._id,
        { $push: { notes: "note456" } },
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        noteFromServer: serverNote,
        newNote,
      });
    });

    it("should convert null title and content to empty strings", async () => {
      req.body.title = null;
      req.body.content = null;

      const note = {
        _id: "note123",
        title: "Old",
        content: "Old",
        version: 1,
        isEncrypted: false,
        save: vi.fn().mockResolvedValue(undefined),
      };

      Note.findById.mockResolvedValue(note);

      await updateNote(req, res);

      expect(note.title).toBe("");
      expect(note.content).toBe("");
    });

    it("should return 500 when database operation fails", async () => {
      Note.findById.mockRejectedValue(new Error("Database error"));

      await updateNote(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server internal error",
      });
    });
  });

  // ============================================================
  // getNode
  // ============================================================

  describe("getNode", () => {
    it("should return a note successfully", async () => {
      req.params.noteId = "note123";

      const note = {
        _id: "note123",
        title: "Test Note",
        content: "Hello World",
        version: 1,
        isEncrypted: false,
      };

      Note.findById.mockResolvedValue(note);

      await getNode(req, res);

      expect(Note.findById).toHaveBeenCalledWith("note123");

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        note,
      });
    });

    it("should return 401 when user is missing", async () => {
      req.user = null;

      await getNode(req, res);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid credentials",
      });

      expect(Note.findById).not.toHaveBeenCalled();
    });

    it("should return 403 for an invalid note id", async () => {
      req.params.noteId = "note999";

      await getNode(req, res);

      expect(res.status).toHaveBeenCalledWith(403);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid note id",
      });

      expect(Note.findById).not.toHaveBeenCalled();
    });

    it("should return 500 when database operation fails", async () => {
      req.params.noteId = "note123";

      Note.findById.mockRejectedValue(new Error("Database error"));

      await getNode(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server internal error",
      });
    });
  });
});
