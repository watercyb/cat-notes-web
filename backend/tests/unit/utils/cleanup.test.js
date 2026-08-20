import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../models/note_model.js", () => ({
  default: {
    distinct: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

vi.mock("../../../models/user_model.js", () => ({
  default: {
    updateMany: vi.fn(),
    find: vi.fn(),
  },
}));

import Note from "../../../models/note_model.js";
import User from "../../../models/user_model.js";
import { cleanup } from "../../../utils/cleanup.js";

describe("cleanup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("removes invalid note references from users and deletes unused notes", async () => {
    const existingNoteIds = ["note1", "note2"];

    Note.distinct.mockResolvedValue(existingNoteIds);

    User.updateMany.mockResolvedValue({});

    User.find.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi
          .fn()
          .mockResolvedValue([
            { notes: ["note1", "note3"] },
            { notes: ["note2", "note4"] },
          ]),
      }),
    });

    Note.deleteMany.mockResolvedValue({});

    await cleanup();

    expect(Note.distinct).toHaveBeenCalledWith("_id");

    expect(User.updateMany).toHaveBeenCalledWith(
      {},
      { $pull: { notes: { $nin: existingNoteIds } } },
    );

    expect(User.find).toHaveBeenCalledWith({});
    expect(Note.deleteMany).toHaveBeenCalledWith({
      _id: { $nin: ["note1", "note3", "note2", "note4"] },
    });
  });

  it("deletes all notes when no users reference any notes", async () => {
    Note.distinct.mockResolvedValue(["note1", "note2"]);

    User.updateMany.mockResolvedValue({});

    User.find.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([{ notes: [] }, { notes: [] }]),
      }),
    });

    Note.deleteMany.mockResolvedValue({});

    await cleanup();

    expect(Note.deleteMany).toHaveBeenCalledWith({
      _id: { $nin: [] },
    });
  });

  it("removes duplicate note IDs before deleting unused notes", async () => {
    Note.distinct.mockResolvedValue(["note1", "note2"]);

    User.updateMany.mockResolvedValue({});

    User.find.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi
          .fn()
          .mockResolvedValue([
            { notes: ["note1", "note2"] },
            { notes: ["note1", "note2"] },
          ]),
      }),
    });

    Note.deleteMany.mockResolvedValue({});

    await cleanup();

    expect(Note.deleteMany).toHaveBeenCalledWith({
      _id: { $nin: ["note1", "note2"] },
    });
  });
});
