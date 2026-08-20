import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSign, mockSetToken, mockRedisSet } = vi.hoisted(() => ({
  mockSign: vi.fn(),
  mockSetToken: vi.fn(),
  mockRedisSet: vi.fn(),
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: mockSign,
  },
}));

vi.mock("../../../db/redis.js", () => ({
  redis: {
    set: mockRedisSet,
  },
}));

vi.mock("../../../utils/tokens.js", () => ({
  setToken: mockSetToken,
}));

import {
  generateToken,
  generateRefreshToken,
  refreshCookieOptions,
} from "../../../utils/jwt.js";

describe("jwt", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.JWT_SECRET = "jwt-secret";
    process.env.REFRESH_TOKEN_SECRET = "refresh-secret";
    process.env.NODE_ENV = "development";
  });

  describe("generateToken", () => {
    it("should set Authorization header for Android app", async () => {
      mockSign.mockReturnValue("access-token");

      const req = {
        headers: {
          "x-client-type": "android-app",
        },
      };

      const res = {
        setHeader: vi.fn(),
        cookie: vi.fn(),
      };

      await generateToken(req, res, "user123");

      expect(mockSign).toHaveBeenCalledWith(
        { userId: "user123" },
        "jwt-secret",
        { expiresIn: "15m" },
      );

      expect(res.setHeader).toHaveBeenCalledWith(
        "Authorization",
        "Bearer access-token",
      );

      expect(res.cookie).not.toHaveBeenCalled();

      expect(mockSetToken).toHaveBeenCalledWith("user123", "access-token");
    });

    it("should set cookie for non-Android clients", async () => {
      mockSign.mockReturnValue("access-token");

      const req = {
        headers: {},
      };

      const res = {
        setHeader: vi.fn(),
        cookie: vi.fn(),
      };

      await generateToken(req, res, "user123");

      expect(res.cookie).toHaveBeenCalledWith("token", "access-token", {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      expect(res.setHeader).not.toHaveBeenCalled();

      expect(mockSetToken).toHaveBeenCalledWith("user123", "access-token");
    });
  });

  describe("generateRefreshToken", () => {
    it("should set refreshToken header for Android app", () => {
      mockSign.mockReturnValue("refresh-token");

      const req = {
        headers: {
          "x-client-type": "android-app",
        },
      };

      const res = {
        setHeader: vi.fn(),
        cookie: vi.fn(),
      };

      const result = generateRefreshToken(req, res, "user123");

      expect(result).toBe("refresh-token");

      expect(mockSign).toHaveBeenCalledWith(
        { userId: "user123" },
        "refresh-secret",
        { expiresIn: "7d" },
      );

      expect(res.setHeader).toHaveBeenCalledWith(
        "refreshToken",
        "Bearer refresh-token",
      );

      expect(res.cookie).not.toHaveBeenCalled();

      expect(mockRedisSet).toHaveBeenCalledWith(
        "CatNotes_RefreshToken_user123",
        "refresh-token",
        { ex: 7 * 24 * 60 * 60 },
      );
    });

    it("should set refreshToken cookie for non-Android clients", () => {
      mockSign.mockReturnValue("refresh-token");

      const req = {
        headers: {},
      };

      const res = {
        setHeader: vi.fn(),
        cookie: vi.fn(),
      };

      const result = generateRefreshToken(req, res, "user123");

      expect(result).toBe("refresh-token");

      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "refresh-token",
        refreshCookieOptions,
      );

      expect(res.setHeader).not.toHaveBeenCalled();

      expect(mockRedisSet).toHaveBeenCalledWith(
        "CatNotes_RefreshToken_user123",
        "refresh-token",
        { ex: 7 * 24 * 60 * 60 },
      );
    });
  });

  describe("refreshCookieOptions", () => {
    it("should have the correct cookie options", () => {
      expect(refreshCookieOptions).toEqual({
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/api/auth/refresh",
      });
    });
  });
});
