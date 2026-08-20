import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const {
  checkLimitMock,
  checkLimitSignupMock,
  checkLimitResetPasswordMock,
  findOneMock,
  createMock,
  findByIdMock,
  selectMock,
  getUserMock,
  verifyMock,
  getTokenMock,
} = vi.hoisted(() => ({
  checkLimitMock: vi.fn(),
  checkLimitSignupMock: vi.fn(),
  checkLimitResetPasswordMock: vi.fn(),
  findOneMock: vi.fn(),
  createMock: vi.fn(),
  findByIdMock: vi.fn(),
  selectMock: vi.fn(),
  getUserMock: vi.fn(),
  verifyMock: vi.fn(),
  getTokenMock: vi.fn(),
}));

vi.mock("../../../db/redis.js", () => ({
  checkLimit: checkLimitMock,
  checkLimitSignup: checkLimitSignupMock,
  checkLimitResetPassword: checkLimitResetPasswordMock,
}));

vi.mock("../../../models/user_model.js", () => ({
  default: {
    findOne: findOneMock,
    create: createMock,
    findById: findByIdMock,
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: verifyMock,
  },
}));

vi.mock("@clerk/express", () => ({
  clerkClient: {
    users: {
      getUser: getUserMock,
    },
  },
}));

vi.mock("../../../utils/tokens.js", () => ({
  getToken: getTokenMock,
}));

import {
  rateCheck,
  rateCheckSignup,
  rateCheckResetPassword,
  verifyToken,
} from "../../../middleware/middleware.js";

describe("auth middleware", () => {
  let req;
  let res;
  let next;
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      headers: {},
      socket: {
        remoteAddress: "127.0.0.1",
      },
      cookies: {},
      auth: vi.fn(() => ({})),
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    next = vi.fn();

    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe("rateCheck", () => {
    it("should call next when rate limit succeeds", async () => {
      checkLimitMock.mockResolvedValue({
        success: true,
      });

      await rateCheck(req, res, next);

      expect(checkLimitMock).toHaveBeenCalledWith("127.0.0.1");
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should return 429 when rate limit fails", async () => {
      checkLimitMock.mockResolvedValue({
        success: false,
      });

      await rateCheck(req, res, next);

      expect(checkLimitMock).toHaveBeenCalledWith("127.0.0.1");
      expect(next).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Too many requests",
      });
    });

    it("should use the first IP from x-forwarded-for", async () => {
      req.headers["x-forwarded-for"] = "192.168.1.10, 10.0.0.1, 10.0.0.2";

      checkLimitMock.mockResolvedValue({
        success: true,
      });

      await rateCheck(req, res, next);

      expect(checkLimitMock).toHaveBeenCalledWith("192.168.1.10");
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should return 500 when checkLimit throws", async () => {
      const error = new Error("Redis error");

      checkLimitMock.mockRejectedValue(error);

      await rateCheck(req, res, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error in ratecheck: ",
        error,
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server internal error",
      });

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("rateCheckSignup", () => {
    it("should call next when signup rate limit succeeds", async () => {
      checkLimitSignupMock.mockResolvedValue({
        success: true,
      });

      await rateCheckSignup(req, res, next);

      expect(checkLimitSignupMock).toHaveBeenCalledWith("127.0.0.1");
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should return 429 when signup rate limit fails", async () => {
      checkLimitSignupMock.mockResolvedValue({
        success: false,
      });

      await rateCheckSignup(req, res, next);

      expect(checkLimitSignupMock).toHaveBeenCalledWith("127.0.0.1");
      expect(next).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Too many requests",
      });
    });

    it("should use the first IP from x-forwarded-for", async () => {
      req.headers["x-forwarded-for"] = "192.168.1.10, 10.0.0.1";

      checkLimitSignupMock.mockResolvedValue({
        success: true,
      });

      await rateCheckSignup(req, res, next);

      expect(checkLimitSignupMock).toHaveBeenCalledWith("192.168.1.10");
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should return 500 when checkLimitSignup throws", async () => {
      const error = new Error("Redis error");

      checkLimitSignupMock.mockRejectedValue(error);

      await rateCheckSignup(req, res, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error in ratecheck: ",
        error,
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server internal error",
      });

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("rateCheckResetPassword", () => {
    it("should call next when reset-password rate limit succeeds", async () => {
      checkLimitResetPasswordMock.mockResolvedValue({
        success: true,
      });

      await rateCheckResetPassword(req, res, next);

      expect(checkLimitResetPasswordMock).toHaveBeenCalledWith("127.0.0.1");
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should return 429 when reset-password rate limit fails", async () => {
      checkLimitResetPasswordMock.mockResolvedValue({
        success: false,
      });

      await rateCheckResetPassword(req, res, next);

      expect(checkLimitResetPasswordMock).toHaveBeenCalledWith("127.0.0.1");
      expect(next).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Too many requests",
      });
    });

    it("should use the first IP from x-forwarded-for", async () => {
      req.headers["x-forwarded-for"] = "192.168.1.10, 10.0.0.1";

      checkLimitResetPasswordMock.mockResolvedValue({
        success: true,
      });

      await rateCheckResetPassword(req, res, next);

      expect(checkLimitResetPasswordMock).toHaveBeenCalledWith("192.168.1.10");
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should return 500 when checkLimitResetPassword throws", async () => {
      const error = new Error("Redis error");

      checkLimitResetPasswordMock.mockRejectedValue(error);

      await rateCheckResetPassword(req, res, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error in ratecheck: ",
        error,
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server internal error",
      });

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("verifyToken", () => {
    describe("Clerk authentication", () => {
      it("should use the existing user when Clerk user exists in database", async () => {
        const user = {
          _id: "123",
          email: "clerk-user-id",
          name: "John Doe",
        };

        req.auth.mockReturnValue({
          userId: "clerk-user-id",
        });

        findOneMock.mockResolvedValue(user);

        await verifyToken(req, res, next);

        expect(findOneMock).toHaveBeenCalledWith({
          email: "clerk-user-id",
        });

        expect(getUserMock).not.toHaveBeenCalled();
        expect(createMock).not.toHaveBeenCalled();

        expect(req.user).toBe(user);
        expect(next).toHaveBeenCalledTimes(1);
      });

      it("should get the Clerk user and create a database user when user does not exist", async () => {
        const clerkUser = {
          id: "clerk-user-id",
          firstName: "John",
          lastName: "Doe",
        };

        const createdUser = {
          _id: "123",
          email: "clerk-user-id",
          name: "John Doe",
          password: "clerkUser",
          isVerified: true,
        };

        req.auth.mockReturnValue({
          userId: "clerk-user-id",
        });

        findOneMock.mockResolvedValue(null);
        getUserMock.mockResolvedValue(clerkUser);
        createMock.mockResolvedValue(createdUser);

        await verifyToken(req, res, next);

        expect(findOneMock).toHaveBeenCalledWith({
          email: "clerk-user-id",
        });

        expect(getUserMock).toHaveBeenCalledWith("clerk-user-id");

        expect(createMock).toHaveBeenCalledWith({
          email: "clerk-user-id",
          name: "John Doe",
          password: "clerkUser",
          isVerified: true,
        });

        expect(req.user).toBe(createdUser);
        expect(next).toHaveBeenCalledTimes(1);
      });

      it("should return 500 when Clerk authentication throws", async () => {
        const error = new Error("Clerk error");

        req.auth.mockReturnValue({
          userId: "clerk-user-id",
        });

        findOneMock.mockRejectedValue(error);

        await verifyToken(req, res, next);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error in verifyToken ",
          error,
        );

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Server internal error",
        });

        expect(next).not.toHaveBeenCalled();
      });
    });

    describe("JWT authentication", () => {
      beforeEach(() => {
        req.auth.mockReturnValue({});
      });

      it("should return 401 when no token is provided", async () => {
        req.cookies = {};

        await verifyToken(req, res, next);

        expect(verifyMock).not.toHaveBeenCalled();
        expect(findByIdMock).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Invalid credentials",
        });
      });

      it("should get token from cookie for web requests", async () => {
        const token = "valid-token";

        req.cookies = {
          token,
        };

        const user = {
          _id: "123",
        };

        findByIdMock.mockReturnValue({
          select: selectMock,
        });

        selectMock.mockResolvedValue(user);

        verifyMock.mockReturnValue({
          userId: "123",
        });

        getTokenMock.mockReturnValue(token);

        await verifyToken(req, res, next);

        expect(verifyMock).toHaveBeenCalledWith(token, process.env.JWT_SECRET);

        expect(findByIdMock).toHaveBeenCalledWith("123");
        expect(selectMock).toHaveBeenCalledWith("-password");
        expect(getTokenMock).toHaveBeenCalledWith("123");

        expect(req.user).toBe(user);
        expect(next).toHaveBeenCalledTimes(1);
      });

      it("should get token from Authorization header for Android app", async () => {
        const token = "android-token";

        req.headers = {
          "x-client-type": "android-app",
          authorization: `Bearer ${token}`,
        };

        const user = {
          _id: "456",
        };

        verifyMock.mockReturnValue({
          userId: "456",
        });

        findByIdMock.mockReturnValue({
          select: selectMock,
        });

        selectMock.mockResolvedValue(user);
        getTokenMock.mockReturnValue(token);

        await verifyToken(req, res, next);

        expect(verifyMock).toHaveBeenCalledWith(token, process.env.JWT_SECRET);

        expect(findByIdMock).toHaveBeenCalledWith("456");
        expect(selectMock).toHaveBeenCalledWith("-password");

        expect(req.user).toBe(user);
        expect(next).toHaveBeenCalledTimes(1);
      });

      it("should return 401 when Android Authorization header is missing", async () => {
        req.headers = {
          "x-client-type": "android-app",
        };

        await verifyToken(req, res, next);

        expect(verifyMock).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Invalid credentials",
        });
      });

      it("should return 401 when Android Authorization header is malformed", async () => {
        req.headers = {
          "x-client-type": "android-app",
          authorization: "invalid-header",
        };

        await verifyToken(req, res, next);

        expect(verifyMock).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Invalid credentials",
        });
      });

      it("should return 401 when JWT verification fails", async () => {
        const error = new Error("Invalid token");

        req.cookies = {
          token: "invalid-token",
        };

        verifyMock.mockImplementation(() => {
          throw error;
        });

        await verifyToken(req, res, next);

        expect(verifyMock).toHaveBeenCalledWith(
          "invalid-token",
          process.env.JWT_SECRET,
        );

        expect(findByIdMock).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Invalid credentials",
        });
      });

      it("should return 401 when jwt.verify returns a falsy value", async () => {
        req.cookies = {
          token: "invalid-token",
        };

        verifyMock.mockReturnValue(null);

        await verifyToken(req, res, next);

        expect(verifyMock).toHaveBeenCalled();
        expect(findByIdMock).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Invalid credentials",
        });
      });

      it("should return 401 when user is not found", async () => {
        req.cookies = {
          token: "valid-token",
        };

        verifyMock.mockReturnValue({
          userId: "123",
        });

        findByIdMock.mockReturnValue({
          select: selectMock,
        });

        selectMock.mockResolvedValue(null);

        await verifyToken(req, res, next);

        expect(findByIdMock).toHaveBeenCalledWith("123");
        expect(selectMock).toHaveBeenCalledWith("-password");
        expect(getTokenMock).not.toHaveBeenCalled();

        expect(next).not.toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Invalid credentials",
        });
      });

      it("should return 401 when stored token does not match request token", async () => {
        const user = {
          _id: "123",
        };

        req.cookies = {
          token: "request-token",
        };

        verifyMock.mockReturnValue({
          userId: "123",
        });

        findByIdMock.mockReturnValue({
          select: selectMock,
        });

        selectMock.mockResolvedValue(user);

        getTokenMock.mockReturnValue("different-token");

        await verifyToken(req, res, next);

        expect(getTokenMock).toHaveBeenCalledWith("123");
        expect(next).not.toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Invalid credentials",
        });
      });

      it("should call next and set req.user when JWT and stored token are valid", async () => {
        const user = {
          _id: "123",
          name: "John",
        };

        const token = "valid-token";

        req.cookies = {
          token,
        };

        verifyMock.mockReturnValue({
          userId: "123",
        });

        findByIdMock.mockReturnValue({
          select: selectMock,
        });

        selectMock.mockResolvedValue(user);

        getTokenMock.mockReturnValue(token);

        await verifyToken(req, res, next);

        expect(verifyMock).toHaveBeenCalledWith(token, process.env.JWT_SECRET);

        expect(findByIdMock).toHaveBeenCalledWith("123");
        expect(selectMock).toHaveBeenCalledWith("-password");
        expect(getTokenMock).toHaveBeenCalledWith("123");

        expect(req.user).toBe(user);
        expect(next).toHaveBeenCalledTimes(1);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
      });

      it("should return 500 when database lookup throws", async () => {
        const error = new Error("Database error");

        req.cookies = {
          token: "valid-token",
        };

        verifyMock.mockReturnValue({
          userId: "123",
        });

        findByIdMock.mockImplementation(() => {
          throw error;
        });

        await verifyToken(req, res, next);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error in verifyToken ",
          error,
        );

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Server internal error",
        });

        expect(next).not.toHaveBeenCalled();
      });
    });
  });
});
