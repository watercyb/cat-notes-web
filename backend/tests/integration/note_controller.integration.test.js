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
import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import Note from "../../models/note_model.js";
import User from "../../models/user_model.js";
import app from "../../app.js";
import { setToken } from "../../utils/tokens.js";

dotenv.config({ quiet: true });

vi.mock("node-cron", () => ({
  schedule: vi.fn(),
}));

vi.mock("../../db/redis.js", () => ({
  redis: {
    del: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
  },

  checkLimit: vi.fn().mockResolvedValue({
    success: true,
  }),
}));

describe("Note Routes Integration Tests", () => {
  let user;
  let token;

  let consoleLogSpy;
  let consoleErrorSpy;

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

    /*
     * Change JWT_SECRET to whatever variable your verifyToken
     * middleware actually uses.
     */
    token = jwt.sign(
      {
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );
    setToken(user._id, token);

    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  afterAll(async () => {
    await Note.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  // -------------------------------------------------------
  // GET /api/note/getNotes
  // -------------------------------------------------------

  describe("GET /api/note/getNotes", () => {
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

      const response = await request(app)
        .get("/api/note/getNotes")
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.notes).toHaveLength(2);

      expect(response.body.notes[0]._id).toBe(note1._id.toString());
      expect(response.body.notes[1]._id).toBe(note2._id.toString());
    });

    it("should return 401 when authentication is missing", async () => {
      const response = await request(app).get("/api/note/getNotes");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: "Invalid credentials",
      });
    });
  });

  // -------------------------------------------------------
  // GET /api/note/getNotesIdAndVersion
  // -------------------------------------------------------

  describe("GET /api/note/getNotesIdAndVersion", () => {
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

      const response = await request(app)
        .get("/api/note/getNotesIdAndVersion")
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.notes).toHaveLength(2);

      expect(response.body.notes[0]._id).toBe(note1._id.toString());
      expect(response.body.notes[0].version).toBe(3);

      expect(response.body.notes[1]._id).toBe(note2._id.toString());
      expect(response.body.notes[1].version).toBe(7);
    });

    it("should return 401 when authentication is missing", async () => {
      const response = await request(app).get("/api/note/getNotesIdAndVersion");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: "Invalid credentials",
      });
    });
  });

  // -------------------------------------------------------
  // POST /api/note/create
  // -------------------------------------------------------

  describe("POST /api/note/create", () => {
    it("should create a note and add it to the user's notes", async () => {
      const response = await request(app)
        .post("/api/note/create")
        .set("Cookie", [`token=${token}`])
        .send({
          title: "Test Note",
          content: "Hello World",
          version: 1,
          isEncrypted: false,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      expect(response.body.note.title).toBe("Test Note");
      expect(response.body.note.content).toBe("Hello World");
      expect(response.body.note.version).toBe(1);
      expect(response.body.note.isEncrypted).toBe(false);

      const savedNote = await Note.findById(response.body.note._id);

      expect(savedNote).not.toBeNull();
      expect(savedNote.title).toBe("Test Note");

      const updatedUser = await User.findById(user._id);

      expect(updatedUser.notes).toHaveLength(1);
      expect(updatedUser.notes[0].toString()).toBe(savedNote._id.toString());
    });

    it("should use empty strings when title and content are null", async () => {
      const response = await request(app)
        .post("/api/note/create")
        .set("Cookie", [`token=${token}`])
        .send({
          title: null,
          content: null,
          version: 1,
          isEncrypted: false,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.note.title).toBe("");
      expect(response.body.note.content).toBe("");
    });

    it("should default isEncrypted to false", async () => {
      const response = await request(app)
        .post("/api/note/create")
        .set("Cookie", [`token=${token}`])
        .send({
          title: "Test",
          content: "Content",
          version: 1,
        });

      expect(response.status).toBe(201);
      expect(response.body.note.isEncrypted).toBe(false);
    });

    it("should return 422 when version is missing", async () => {
      const response = await request(app)
        .post("/api/note/create")
        .set("Cookie", [`token=${token}`])
        .send({
          title: "Test",
          content: "Content",
        });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        success: false,
        message: "All fields are required",
      });
    });

    it("should return 401 when authentication is missing", async () => {
      const response = await request(app).post("/api/note/create").send({
        title: "Test",
        content: "Content",
        version: 1,
      });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: "Invalid credentials",
      });
    });
  });

  // -------------------------------------------------------
  // DELETE /api/note/:noteId
  // -------------------------------------------------------

  describe("DELETE /api/note/:noteId", () => {
    it("should delete the note and remove it from the user", async () => {
      const note = await Note.create({
        title: "Delete Me",
        content: "Content",
        version: 1,
        isEncrypted: false,
      });

      user.notes.push(note._id);
      await user.save();

      const response = await request(app)
        .delete(`/api/note/${note._id}`)
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
      });

      const deletedNote = await Note.findById(note._id);

      expect(deletedNote).toBeNull();

      const updatedUser = await User.findById(user._id);

      expect(updatedUser.notes).toHaveLength(0);
    });

    it("should return success when note does not belong to user", async () => {
      const note = await Note.create({
        title: "Other Note",
        content: "Content",
        version: 1,
        isEncrypted: false,
      });

      const response = await request(app)
        .delete(`/api/note/${note._id}`)
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
      });

      const existingNote = await Note.findById(note._id);

      expect(existingNote).not.toBeNull();
    });

    it("should return 401 when authentication is missing", async () => {
      const noteId = new mongoose.Types.ObjectId();

      const response = await request(app).delete(`/api/note/${noteId}`);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: "Invalid credentials",
      });
    });
  });

  // -------------------------------------------------------
  // POST /api/note/update
  // -------------------------------------------------------

  describe("POST /api/note/update", () => {
    it("should update the existing note when the new version is higher", async () => {
      const note = await Note.create({
        title: "Old Title",
        content: "Old Content",
        version: 1,
        isEncrypted: false,
      });

      user.notes.push(note._id);
      await user.save();

      const response = await request(app)
        .post("/api/note/update")
        .set("Cookie", [`token=${token}`])
        .send({
          noteId: note._id.toString(),
          title: "New Title",
          content: "New Content",
          version: 2,
          isEncrypted: false,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.note.title).toBe("New Title");
      expect(response.body.note.content).toBe("New Content");
      expect(response.body.note.version).toBe(2);

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

      const response = await request(app)
        .post("/api/note/update")
        .set("Cookie", [`token=${token}`])
        .send({
          noteId: note._id.toString(),
          title: "Old Title",
          content: "Old Content",
          version: 3,
          isEncrypted: false,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.note._id).toBe(note._id.toString());
      expect(response.body.note.version).toBe(5);
      expect(response.body.note.title).toBe("Server Title");
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

      const response = await request(app)
        .post("/api/note/update")
        .set("Cookie", [`token=${token}`])
        .send({
          noteId: note._id.toString(),
          title: "Same Title",
          content: "Same Content",
          version: 5,
          isEncrypted: false,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.note._id).toBe(note._id.toString());
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

      const response = await request(app)
        .post("/api/note/update")
        .set("Cookie", [`token=${token}`])
        .send({
          noteId: note._id.toString(),
          title: "Client Title",
          content: "Client Content",
          version: 5,
          isEncrypted: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);

      expect(response.body.noteFromServer._id).toBe(note._id.toString());

      expect(response.body.newNote).toBeDefined();
      expect(response.body.newNote.title).toBe("Client Title");
      expect(response.body.newNote.content).toBe("Client Content");
      expect(response.body.newNote.version).toBe(5);
      expect(response.body.newNote.isEncrypted).toBe(true);

      const notes = await Note.find({});

      expect(notes).toHaveLength(2);

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

      const response = await request(app)
        .post("/api/note/update")
        .set("Cookie", [`token=${token}`])
        .send({
          noteId: note._id.toString(),
          title: "Updated",
          content: "Updated",
          version: 2,
          isEncrypted: false,
        });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        success: false,
        message: "Invalid note id",
      });

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

      const response = await request(app)
        .post("/api/note/update")
        .set("Cookie", [`token=${token}`])
        .send({
          noteId: note._id.toString(),
          title: "Updated",
          content: "Updated",
          isEncrypted: false,
        });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
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

      const response = await request(app)
        .post("/api/note/update")
        .set("Cookie", [`token=${token}`])
        .send({
          noteId: note._id.toString(),
          title: "Updated",
          content: "Updated",
          version: 2,
        });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        success: false,
        message: "All fields are required",
      });
    });

    it("should return 403 when note does not exist", async () => {
      const noteId = new mongoose.Types.ObjectId();

      user.notes.push(noteId);
      await user.save();

      const response = await request(app)
        .post("/api/note/update")
        .set("Cookie", [`token=${token}`])
        .send({
          noteId: noteId.toString(),
          title: "Updated",
          content: "Updated",
          version: 2,
          isEncrypted: false,
        });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
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

      const response = await request(app)
        .post("/api/note/update")
        .set("Cookie", [`token=${token}`])
        .send({
          noteId: note._id.toString(),
          title: null,
          content: null,
          version: 2,
          isEncrypted: false,
        });

      expect(response.status).toBe(200);
      expect(response.body.note.title).toBe("");
      expect(response.body.note.content).toBe("");
    });
  });

  // -------------------------------------------------------
  // GET /api/note/:noteId
  // -------------------------------------------------------

  describe("GET /api/note/:noteId", () => {
    it("should return the requested note", async () => {
      const note = await Note.create({
        title: "Test Note",
        content: "Test Content",
        version: 3,
        isEncrypted: true,
      });

      user.notes.push(note._id);
      await user.save();

      const response = await request(app)
        .get(`/api/note/${note._id}`)
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.note._id).toBe(note._id.toString());
      expect(response.body.note.title).toBe("Test Note");
      expect(response.body.note.content).toBe("Test Content");
      expect(response.body.note.version).toBe(3);
      expect(response.body.note.isEncrypted).toBe(true);
    });

    it("should return 403 when note does not belong to user", async () => {
      const note = await Note.create({
        title: "Other Note",
        content: "Content",
        version: 1,
        isEncrypted: false,
      });

      const response = await request(app)
        .get(`/api/note/${note._id}`)
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        success: false,
        message: "Invalid note id",
      });
    });

    it("should return 401 when authentication is missing", async () => {
      const noteId = new mongoose.Types.ObjectId();

      const response = await request(app).get(`/api/note/${noteId}`);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: "Invalid credentials",
      });
    });
  });
});
