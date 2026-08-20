import { describe, it, expect, vi } from "vitest";

const mockUse = vi.fn();
const mockGet = vi.fn();
const mockListen = vi.fn();

vi.mock("express", () => {
  const express = vi.fn(() => ({
    use: mockUse,
    get: mockGet,
    listen: mockListen,
  }));

  express.json = vi.fn(() => "jsonMiddleware");
  express.static = vi.fn(() => "staticMiddleware");

  return {
    default: express,
  };
});

vi.mock("cookie-parser", () => ({
  default: vi.fn(() => "cookieMiddleware"),
}));

vi.mock("@clerk/express", () => ({
  clerkMiddleware: vi.fn(() => "clerkMiddleware"),
}));

vi.mock("../../routes/auth_route.js", () => ({
  default: "authRoutes",
}));

vi.mock("../../routes/note_route.js", () => ({
  default: "noteRoutes",
}));

vi.mock("../../routes/analytics_route.js", () => ({
  default: "analyticsRoutes",
}));

vi.mock("../../middleware/middleware.js", () => ({
  rateCheck: "rateCheck",
}));

vi.mock("../../utils/cleanup.js", () => ({
  cleanup: vi.fn(),
}));

vi.mock("../../controllers/analytics_controller.js", () => ({
  exportdb: vi.fn(),
}));

vi.mock("node-cron", () => ({
  default: {
    schedule: vi.fn(),
  },
}));

vi.mock("../../db/mongodb.js", () => ({
  connectDB: vi.fn(),
}));

vi.mock("dotenv", () => ({
  default: {
    config: vi.fn(),
  },
}));

describe("server.js", () => {
  it("creates the Express app", async () => {
    const { default: express } = await import("express");

    await import("../../server.js");

    expect(express).toHaveBeenCalled();
  });

  it("registers Clerk middleware", async () => {
    const { clerkMiddleware } = await import("@clerk/express");

    await import("../../server.js");

    expect(clerkMiddleware).toHaveBeenCalled();
    expect(mockUse).toHaveBeenCalledWith("clerkMiddleware");
  });

  it("registers JSON middleware", async () => {
    const { default: express } = await import("express");

    await import("../../server.js");

    expect(express.json).toHaveBeenCalled();
    expect(mockUse).toHaveBeenCalledWith("jsonMiddleware");
  });

  it("registers cookie parser middleware", async () => {
    await import("../../server.js");

    expect(mockUse).toHaveBeenCalledWith("cookieMiddleware");
  });

  it("registers auth route", async () => {
    await import("../../server.js");

    expect(mockUse).toHaveBeenCalledWith(
      "/api/auth",
      "rateCheck",
      "authRoutes",
    );
  });

  it("registers note route", async () => {
    await import("../../server.js");

    expect(mockUse).toHaveBeenCalledWith(
      "/api/note",
      "rateCheck",
      "noteRoutes",
    );
  });

  it("registers analytics route", async () => {
    await import("../../server.js");

    expect(mockUse).toHaveBeenCalledWith(
      "/api/analytics",
      "rateCheck",
      "analyticsRoutes",
    );
  });

  it("registers 404 middleware", async () => {
    await import("../../server.js");

    expect(mockUse).toHaveBeenCalledWith(expect.any(Function));
  });

  it("registers cron job", async () => {
    const cron = (await import("node-cron")).default;

    await import("../../server.js");

    expect(cron.schedule).toHaveBeenCalledWith(
      "0 3 * * *",
      expect.any(Function),
    );
  });

  it("starts the server", async () => {
    await import("../../server.js");

    expect(mockListen).toHaveBeenCalled();
  });
});
