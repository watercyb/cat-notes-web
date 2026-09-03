import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";

import app from "../../app.js";
import User from "../../models/user_model.js";
import Note from "../../models/note_model.js";
import { getMailCount } from "../../mails/mailtrap.js";

vi.mock("../../mails/mailtrap.js", () => ({
  getMailCount: vi.fn(),
}));

const countUsersMock = vi.spyOn(User, "countDocuments");
const countNotesMock = vi.spyOn(Note, "countDocuments");

describe("GET /api/analytics", () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();

    process.env.ANALYTICS_TOKEN = "test-token";
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should return success without data when token is invalid", async () => {
    const response = await request(app).get("/api/analytics").query({
      token: "wrong-token",
    });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
    });

    expect(countUsersMock).not.toHaveBeenCalled();
    expect(countNotesMock).not.toHaveBeenCalled();
    expect(getMailCount).not.toHaveBeenCalled();
  });

  it("should return analytics data when token is valid", async () => {
    countUsersMock.mockResolvedValue(100);
    countNotesMock.mockResolvedValue(250);
    getMailCount.mockReturnValue(50);

    const response = await request(app).get("/api/analytics").query({
      token: "test-token",
    });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      users: 100,
      notes: 250,
      mails: 50,
    });

    expect(countUsersMock).toHaveBeenCalledTimes(1);
    expect(countNotesMock).toHaveBeenCalledTimes(1);
    expect(getMailCount).toHaveBeenCalledTimes(1);
  });

  it("should return 500 when an error occurs", async () => {
    countUsersMock.mockRejectedValue(new Error("Database error"));

    const response = await request(app).get("/api/analytics").query({
      token: "test-token",
    });

    expect(response.status).toBe(500);

    expect(response.body).toEqual({
      success: false,
      message: "Server internal error",
    });
  });
});
