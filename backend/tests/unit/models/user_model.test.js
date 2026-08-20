import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import User from "../../../models/user_model.js";

describe("User model", () => {
  it("should have the correct model name", () => {
    expect(User.modelName).toBe("User");
  });

  it("should have the correct schema fields", () => {
    const paths = User.schema.paths;

    expect(paths.name).toBeDefined();
    expect(paths.email).toBeDefined();
    expect(paths.password).toBeDefined();
    expect(paths.notes).toBeDefined();
    expect(paths.lastLogin).toBeDefined();
    expect(paths.isVerified).toBeDefined();
    expect(paths.resetPasswordToken).toBeDefined();
    expect(paths.resetPasswordExpiresAt).toBeDefined();
    expect(paths.verificationToken).toBeDefined();
    expect(paths.verificationTokenExpiresAt).toBeDefined();

    expect(paths.createdAt).toBeDefined();
    expect(paths.updatedAt).toBeDefined();
  });

  it("should require name, email, and password", async () => {
    const user = new User({});

    await expect(user.validate()).rejects.toMatchObject({
      errors: {
        name: expect.anything(),
        email: expect.anything(),
        password: expect.anything(),
      },
    });
  });

  it("should accept a valid user", async () => {
    const user = new User({
      name: "John",
      email: "john@example.com",
      password: "password123",
    });

    await expect(user.validate()).resolves.toBeUndefined();
  });

  it("should set default values", () => {
    const before = new Date();

    const user = new User({
      name: "John",
      email: "john@example.com",
      password: "password123",
    });

    const after = new Date();

    expect(user.isVerified).toBe(false);

    expect(user.lastLogin).toBeInstanceOf(Date);
    expect(user.lastLogin.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(user.lastLogin.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("should define email as unique and indexed", () => {
    const emailPath = User.schema.path("email");

    expect(emailPath.options.unique).toBe(true);
    expect(emailPath.options.index).toBe(true);
  });

  it("should define notes as an array of ObjectIds referencing Note", () => {
    const notesDefinition = User.schema.obj.notes;

    expect(Array.isArray(notesDefinition)).toBe(true);
    expect(notesDefinition).toHaveLength(1);

    expect(notesDefinition[0].type).toBe(mongoose.Schema.Types.ObjectId);
    expect(notesDefinition[0].ref).toBe("Note");
  });

  it("should accept ObjectIds in notes", async () => {
    const noteId = new mongoose.Types.ObjectId();

    const user = new User({
      name: "John",
      email: "john@example.com",
      password: "password123",
      notes: [noteId],
    });

    const error = await user.validate();

    expect(error).toBeUndefined();
    expect(user.notes[0]).toEqual(noteId);
  });

  it("should accept reset password fields", async () => {
    const expiresAt = new Date();

    const user = new User({
      name: "John",
      email: "john@example.com",
      password: "password123",
      resetPasswordToken: "reset-token",
      resetPasswordExpiresAt: expiresAt,
    });

    await expect(user.validate()).resolves.toBeUndefined();

    expect(user.resetPasswordToken).toBe("reset-token");
    expect(user.resetPasswordExpiresAt).toEqual(expiresAt);
  });

  it("should accept verification fields", async () => {
    const expiresAt = new Date();

    const user = new User({
      name: "John",
      email: "john@example.com",
      password: "password123",
      verificationToken: "verification-token",
      verificationTokenExpiresAt: expiresAt,
    });

    await expect(user.validate()).resolves.toBeUndefined();

    expect(user.verificationToken).toBe("verification-token");
    expect(user.verificationTokenExpiresAt).toEqual(expiresAt);
  });

  it("should have timestamps enabled", () => {
    expect(User.schema.options.timestamps).toBe(true);
  });
});
