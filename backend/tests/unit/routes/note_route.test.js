import { describe, it, expect, vi } from "vitest";

const { mockControllers, mockVerifyToken } = vi.hoisted(() => ({
  mockControllers: {
    createNote: vi.fn(),
    deleteNode: vi.fn(),
    getNode: vi.fn(),
    getNotes: vi.fn(),
    getNotesIdAndVersion: vi.fn(),
    updateNote: vi.fn(),
  },
  mockVerifyToken: vi.fn(),
}));

vi.mock("../../../controllers/note_controller.js", () => mockControllers);

vi.mock("../../../middleware/middleware.js", () => ({
  verifyToken: mockVerifyToken,
}));

const { default: router } = await import("../../../routes/note_route.js");

describe("note_route", () => {
  it("should define GET /getNotes", () => {
    const route = router.stack.find(
      (layer) => layer.route?.path === "/getNotes",
    );

    expect(route).toBeDefined();
    expect(route.route.methods.get).toBe(true);
    expect(route.route.stack[0].handle).toBe(mockVerifyToken);
    expect(route.route.stack[1].handle).toBe(mockControllers.getNotes);
  });

  it("should define GET /getNotesIdAndVersion", () => {
    const route = router.stack.find(
      (layer) => layer.route?.path === "/getNotesIdAndVersion",
    );

    expect(route).toBeDefined();
    expect(route.route.methods.get).toBe(true);
    expect(route.route.stack[0].handle).toBe(mockVerifyToken);
    expect(route.route.stack[1].handle).toBe(
      mockControllers.getNotesIdAndVersion,
    );
  });

  it("should define POST /create", () => {
    const route = router.stack.find((layer) => layer.route?.path === "/create");

    expect(route).toBeDefined();
    expect(route.route.methods.post).toBe(true);
    expect(route.route.stack[0].handle).toBe(mockVerifyToken);
    expect(route.route.stack[1].handle).toBe(mockControllers.createNote);
  });

  it("should define DELETE /:noteId", () => {
    const route = router.stack.find(
      (layer) => layer.route?.path === "/:noteId",
    );

    expect(route).toBeDefined();
    expect(route.route.methods.delete).toBe(true);
    expect(route.route.stack[0].handle).toBe(mockVerifyToken);
    expect(route.route.stack[1].handle).toBe(mockControllers.deleteNode);
  });

  it("should define POST /update", () => {
    const route = router.stack.find((layer) => layer.route?.path === "/update");

    expect(route).toBeDefined();
    expect(route.route.methods.post).toBe(true);
    expect(route.route.stack[0].handle).toBe(mockVerifyToken);
    expect(route.route.stack[1].handle).toBe(mockControllers.updateNote);
  });

  it("should define GET /:noteId", () => {
    const route = router.stack.find(
      (layer) =>
        layer.route?.path === "/:noteId" && layer.route.methods?.get === true,
    );

    expect(route).toBeDefined();
    expect(route.route.methods.get).toBe(true);
    expect(route.route.stack[0].handle).toBe(mockVerifyToken);
    expect(route.route.stack[1].handle).toBe(mockControllers.getNode);
  });
});
