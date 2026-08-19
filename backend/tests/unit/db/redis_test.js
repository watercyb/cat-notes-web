import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const limitMock = vi.fn();

vi.mock("@upstash/redis", () => ({
  Redis: vi.fn(() => ({
    // Redis instance doesn't need any behavior for these tests.
  })),
}));

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    constructor() {
      this.limit = limitMock;
    }

    static slidingWindow() {
      return {};
    }
  },
}));

vi.mock("dotenv", () => ({
  default: {
    config: vi.fn(),
  },
}));

import {
  redis,
  checkLimit,
  checkLimitSignup,
  checkLimitResetPassword,
} from "../../../redis.js";

describe("redis", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("checkLimit", () => {
    it("should call rate limiter with the identifier", async () => {
      const result = {
        success: true,
        limit: 60,
        remaining: 59,
      };

      limitMock.mockResolvedValue(result);

      const response = await checkLimit("user-123");

      expect(limitMock).toHaveBeenCalledWith("user-123");
      expect(response).toBe(result);
    });

    it("should propagate errors from the rate limiter", async () => {
      const error = new Error("Redis error");

      limitMock.mockRejectedValue(error);

      await expect(checkLimit("user-123")).rejects.toThrow("Redis error");
    });
  });

  describe("checkLimitSignup", () => {
    it("should call rate limiter with the identifier", async () => {
      const result = {
        success: false,
        limit: 2,
        remaining: 0,
      };

      limitMock.mockResolvedValue(result);

      const response = await checkLimitSignup("192.168.1.1");

      expect(limitMock).toHaveBeenCalledWith("192.168.1.1");
      expect(response).toBe(result);
    });

    it("should propagate errors from the rate limiter", async () => {
      const error = new Error("Redis error");

      limitMock.mockRejectedValue(error);

      await expect(checkLimitSignup("192.168.1.1")).rejects.toThrow(
        "Redis error",
      );
    });
  });

  describe("checkLimitResetPassword", () => {
    it("should call rate limiter with the identifier", async () => {
      const result = {
        success: true,
        limit: 2,
        remaining: 1,
      };

      limitMock.mockResolvedValue(result);

      const response = await checkLimitResetPassword("user-123");

      expect(limitMock).toHaveBeenCalledWith("user-123");
      expect(response).toBe(result);
    });

    it("should propagate errors from the rate limiter", async () => {
      const error = new Error("Redis error");

      limitMock.mockRejectedValue(error);

      await expect(checkLimitResetPassword("user-123")).rejects.toThrow(
        "Redis error",
      );
    });
  });
});
