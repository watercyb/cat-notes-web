import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import mongoose from "mongoose";
import { connectDB } from "../../../db/mongodb.js";

vi.mock("mongoose", () => ({
  default: {
    connect: vi.fn(),
  },
}));

vi.mock("dotenv", () => ({
  default: {
    config: vi.fn(),
  },
}));

describe("connectDB", () => {
  const originalExit = process.exit;

  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    process.exit = vi.fn();
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.exit = originalExit;
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should connect to MongoDB successfully", async () => {
    mongoose.connect.mockResolvedValue();

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);
  });

  it("should exit the process when MongoDB connection fails", async () => {
    const error = new Error("Database connection failed");

    mongoose.connect.mockRejectedValue(error);

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);

    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
