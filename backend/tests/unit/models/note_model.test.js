import { describe, expect, it } from "vitest";
import Note from "../../../models/note_model.js";

describe("Note model", () => {
  it("should have the expected schema fields", () => {
    const { paths } = Note.schema;

    expect(paths.title.instance).toBe("String");
    expect(paths.content.instance).toBe("String");
    expect(paths.version.instance).toBe("Number");
    expect(paths.isEncrypted.instance).toBe("Boolean");
  });

  it("should require version and isEncrypted", () => {
    expect(Note.schema.path("version").isRequired).toBe(true);
    expect(Note.schema.path("isEncrypted").isRequired).toBe(true);

    expect(Note.schema.path("title").isRequired).toBe(false);
    expect(Note.schema.path("content").isRequired).toBe(false);
  });

  it("should have timestamps enabled", () => {
    expect(Note.schema.path("createdAt")).toBeDefined();
    expect(Note.schema.path("updatedAt")).toBeDefined();
  });

  it("should validate a valid note", async () => {
    const note = new Note({
      title: "Test Note",
      content: "Test content",
      version: 1,
      isEncrypted: false,
    });

    await expect(note.validate()).resolves.toBeUndefined();
  });

  it("should fail validation when version is missing", async () => {
    const note = new Note({
      title: "Test Note",
      content: "Test content",
      isEncrypted: false,
    });

    await expect(note.validate()).rejects.toThrow();
  });

  it("should fail validation when isEncrypted is missing", async () => {
    const note = new Note({
      title: "Test Note",
      content: "Test content",
      version: 1,
    });

    await expect(note.validate()).rejects.toThrow();
  });
});
