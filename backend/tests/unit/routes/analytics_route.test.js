import { describe, it, expect, vi } from "vitest";
import express from "express";

const { analytics } = vi.hoisted(() => ({
  analytics: vi.fn(),
}));

vi.mock("../../../controllers/analytics_controller.js", () => ({
  analytics,
}));

import router from "../../../routes/analytics_route.js";

describe("analytics_route", () => {
  it("should register GET / with analytics controller", () => {
    const app = express();
    app.use(router);

    const route = router.stack.find((layer) => layer.route?.path === "/");

    expect(route).toBeDefined();
    expect(route.route.methods.get).toBe(true);
    expect(route.route.stack[0].handle).toBe(analytics);
  });
});
