import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import mongoose from "mongoose";
import { connectDB } from "../../../db/mongodb.js";

vi.mock("mongoose", () => ({
  default: {
    connect: vi.fn(),
  },
}));

describe("connectDB", () => {
  const originalExit = process.exit;

  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    process.exit = vi.fn();
    consoleErrorSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    process.exit = originalExit;
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
