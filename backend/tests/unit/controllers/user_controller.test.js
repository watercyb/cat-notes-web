import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ---------------------------------------------------------
// Mocks
// ---------------------------------------------------------

vi.mock("../../../models/user_model.js", () => ({
  default: {
    findOne: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("../../../utils/jwt.js", () => ({
  generateRefreshToken: vi.fn(),
  generateToken: vi.fn(),
  refreshCookieOptions: {
    httpOnly: true,
    sameSite: "strict",
  },
}));

vi.mock("../../../mails/mailtrap.js", () => ({
  sendPasswordchangedEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendResetSuccessEmail: vi.fn(),
  sendVerificationEmail: vi.fn(),
  sendWelcomeEmail: vi.fn(),
}));

vi.mock("../../../db/redis.js", () => ({
  redis: {
    del: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock("crypto", () => ({
  default: {
    randomBytes: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
  },
}));

// ---------------------------------------------------------
// Imports after mocks
// ---------------------------------------------------------

import User from "../../../models/user_model.js";
import bcrypt from "bcryptjs";
import { generateRefreshToken, generateToken } from "../../../utils/jwt.js";
import {
  sendPasswordchangedEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../../../mails/mailtrap.js";
import crypto from "crypto";
import { redis } from "../../../db/redis.js";
import jwt from "jsonwebtoken";

import {
  signup,
  login,
  logout,
  checkAuth,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendEmailVerification,
  changePassword,
  changeUsername,
  refresh,
  deleteAccount,
} from "../../../controllers/user_controller.js";

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------

const createReq = (overrides = {}) => ({
  body: {},
  params: {},
  headers: {},
  cookies: {},
  user: null,
  ...overrides,
});

const createRes = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    clearCookie: vi.fn().mockReturnThis(),
  };

  return res;
};

// For:
// User.findOne(...).populate("notes")
// User.findById(...).populate("notes")
const mockQueryWithPopulate = (value) => ({
  populate: vi.fn().mockResolvedValue(value),
});

// ---------------------------------------------------------
// Tests
// ---------------------------------------------------------

describe("user_controller", () => {
  let consoleErrorSpy;
  
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.RENDER_EXTERNAL_URL = "https://example.com";
    process.env.REFRESH_TOKEN_SECRET = "test-secret";

    // Keep Math.random deterministic so signup/resend token
    // is predictable.
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    consoleErrorSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });
  // =======================================================
  // signup
  // =======================================================

  describe("signup", () => {
    it("should return 422 when req.body is missing", async () => {
      const req = createReq({ body: null });
      const res = createRes();

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "All fields are required",
      });

      expect(User.findOne).not.toHaveBeenCalled();
    });

    it("should return 409 when user already exists", async () => {
      const req = createReq({
        body: {
          name: "John",
          email: "john@test.com",
          password: "password",
        },
      });
      const res = createRes();

      User.findOne.mockResolvedValue({
        _id: "user123",
      });

      await signup(req, res);

      expect(User.findOne).toHaveBeenCalledWith({
        email: "john@test.com",
      });

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User already exists",
      });

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(User.create).not.toHaveBeenCalled();
    });

    it("should return 422 when required fields are missing", async () => {
      const req = createReq({
        body: {
          name: "John",
          email: "john@test.com",
          password: "",
        },
      });
      const res = createRes();

      User.findOne.mockResolvedValue(null);

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "All fields are required",
      });
    });

    it("should create a user successfully", async () => {
      const req = createReq({
        body: {
          name: "John",
          email: "john@test.com",
          password: "password123",
        },
      });
      const res = createRes();

      User.findOne.mockResolvedValue(null);

      bcrypt.hash.mockResolvedValue("hashed-password");

      const user = {
        _id: "user123",
        name: "John",
        email: "john@test.com",
        password: "hashed-password",
        notes: [],
        isVerified: false,
      };

      User.create.mockResolvedValue(user);

      await signup(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);

      expect(User.create).toHaveBeenCalledWith({
        email: "john@test.com",
        password: "hashed-password",
        name: "John",
        verificationToken: "550000",
        verificationTokenExpiresAt: expect.any(Number),
      });

      expect(generateToken).toHaveBeenCalledWith(req, res, "user123");

      expect(generateRefreshToken).toHaveBeenCalledWith(req, res, "user123");

      expect(sendVerificationEmail).toHaveBeenCalledWith(
        "john@test.com",
        "550000",
      );

      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User created successfully",
        user: {
          name: "John",
          email: "john@test.com",
          notes: [],
          isVerified: false,
        },
      });

      expect(user.password).toBeUndefined();
    });

    it("should return 500 when signup throws an error", async () => {
      const req = createReq({
        body: {
          name: "John",
          email: "john@test.com",
          password: "password123",
        },
      });
      const res = createRes();

      User.findOne.mockRejectedValue(new Error("Database error"));

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server internal error",
      });
    });
  });

  // =======================================================
  // login
  // =======================================================

  describe("login", () => {
    it("should return 401 for clerk user", async () => {
      const req = createReq({
        body: {
          email: "clerk@test.com",
          password: "password",
        },
      });
      const res = createRes();

      User.findOne.mockReturnValue(
        mockQueryWithPopulate({
          _id: "user123",
          password: "clerkUser",
        }),
      );

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Password login isn't enabled for this account",
      });

      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("should return 401 when user does not exist", async () => {
      const req = createReq({
        body: {
          email: "unknown@test.com",
          password: "password",
        },
      });
      const res = createRes();

      User.findOne.mockReturnValue(mockQueryWithPopulate(null));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid credentials",
      });
    });

    it("should return 401 when password is incorrect", async () => {
      const req = createReq({
        body: {
          email: "john@test.com",
          password: "wrong-password",
        },
      });
      const res = createRes();

      const user = {
        _id: "user123",
        password: "hashed-password",
      };

      User.findOne.mockReturnValue(mockQueryWithPopulate(user));

      bcrypt.compare.mockResolvedValue(false);

      await login(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "wrong-password",
        "hashed-password",
      );

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid credentials",
      });
    });

    it("should login successfully", async () => {
      const req = createReq({
        body: {
          email: "john@test.com",
          password: "password123",
        },
      });
      const res = createRes();

      const user = {
        _id: "user123",
        name: "John",
        email: "john@test.com",
        password: "hashed-password",
        notes: ["note1"],
        isVerified: true,
        save: vi.fn().mockResolvedValue(undefined),
      };

      User.findOne.mockReturnValue(mockQueryWithPopulate(user));

      bcrypt.compare.mockResolvedValue(true);

      await login(req, res);

      expect(generateToken).toHaveBeenCalledWith(req, res, "user123");

      expect(generateRefreshToken).toHaveBeenCalledWith(req, res, "user123");

      expect(user.save).toHaveBeenCalled();

      expect(user.lastLogin).toBeInstanceOf(Date);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Logged in successfully",
        user: {
          name: "John",
          email: "john@test.com",
          notes: ["note1"],
          isVerified: true,
        },
      });
    });

    it("should return 500 when login throws an error", async () => {
      const req = createReq({
        body: {
          email: "john@test.com",
          password: "password",
        },
      });
      const res = createRes();

      User.findOne.mockReturnValue({
        populate: vi.fn().mockRejectedValue(new Error("Database error")),
      });

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server internal error",
      });
    });
  });

  // =======================================================
  // logout
  // =======================================================

  describe("logout", () => {
    it("should logout successfully with a user", async () => {
      const req = createReq({
        user: {
          _id: "user123",
        },
      });
      const res = createRes();

      redis.del.mockResolvedValue(1);

      await logout(req, res);

      expect(redis.del).toHaveBeenCalledWith("refresh_token:user123");

      expect(res.clearCookie).toHaveBeenCalledWith("token");

      expect(res.clearCookie).toHaveBeenCalledWith(
        "refreshToken",
        expect.any(Object),
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Logged out successfully",
      });
    });

    it("should logout successfully without a user", async () => {
      const req = createReq({
        user: null,
      });
      const res = createRes();

      await logout(req, res);

      expect(redis.del).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 500 when logout throws an error", async () => {
      const req = createReq({
        user: {
          _id: "user123",
        },
      });
      const res = createRes();

      redis.del.mockRejectedValue(new Error("Redis error"));

      await logout(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server internal error",
      });
    });
  });

  // =======================================================
  // checkAuth
  // =======================================================

  describe("checkAuth", () => {
    it("should return 401 when user does not exist", async () => {
      const req = createReq({
        user: {
          _id: "user123",
        },
      });
      const res = createRes();

      User.findById.mockReturnValue(mockQueryWithPopulate(null));

      await checkAuth(req, res);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid credentials",
      });
    });

    it("should return user information successfully", async () => {
      const req = createReq({
        user: {
          _id: "user123",
        },
      });
      const res = createRes();

      const user = {
        name: "John",
        email: "john@test.com",
        notes: ["note1"],
        isVerified: true,
      };

      User.findById.mockReturnValue(mockQueryWithPopulate(user));

      await checkAuth(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user,
      });
    });

    it("should return 500 when checkAuth throws an error", async () => {
      const req = createReq({
        user: {
          _id: "user123",
        },
      });
      const res = createRes();

      User.findById.mockReturnValue({
        populate: vi.fn().mockRejectedValue(new Error("Database error")),
      });

      await checkAuth(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server internal error",
      });
    });
  });

  // =======================================================
  // verifyEmail
  // =======================================================

  describe("verifyEmail", () => {
    it("should return 403 when user does not exist", async () => {
      const req = createReq({
        body: {
          code: "123456",
        },
        user: {
          _id: "user123",
        },
      });
      const res = createRes();

      User.findById.mockReturnValue(mockQueryWithPopulate(null));

      await verifyEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(403);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid or expired verification code",
      });
    });

    it("should return 403 when verification code is wrong", async () => {
      const req = createReq({
        body: {
          code: "123456",
        },
        user: {
          _id: "user123",
        },
      });
      const res = createRes();

      const user = {
        verificationToken: "654321",
        verificationTokenExpiresAt: Date.now() + 100000,
      };

      User.findById.mockReturnValue(mockQueryWithPopulate(user));

      await verifyEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid or expired verification code",
      });
    });

    it("should return 403 when verification code is expired", async () => {
      const req = createReq({
        body: {
          code: "123456",
        },
        user: {
          _id: "user123",
        },
      });
      const res = createRes();

      const user = {
        verificationToken: "123456",
        verificationTokenExpiresAt: Date.now() - 1000,
      };

      User.findById.mockReturnValue(mockQueryWithPopulate(user));

      await verifyEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid or expired verification code",
      });
    });

    it("should verify email successfully", async () => {
      const req = createReq({
        body: {
          code: "123456",
        },
        user: {
          _id: "user123",
        },
      });
      const res = createRes();

      const user = {
        name: "John",
        email: "john@test.com",
        notes: [],
        isVerified: false,
        verificationToken: "123456",
        verificationTokenExpiresAt: Date.now() + 100000,
        save: vi.fn().mockResolvedValue(undefined),
      };

      User.findById.mockReturnValue(mockQueryWithPopulate(user));

      await verifyEmail(req, res);

      expect(user.isVerified).toBe(true);
      expect(user.verificationToken).toBeUndefined();
      expect(user.verificationTokenExpiresAt).toBeUndefined();

      expect(user.save).toHaveBeenCalled();

      expect(sendWelcomeEmail).toHaveBeenCalledWith("john@test.com", "John");

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Email verified successfully",
        user: {
          name: "John",
          email: "john@test.com",
          notes: [],
          isVerified: true,
        },
      });
    });

    it("should return 500 when verifyEmail throws an error", async () => {
      const req = createReq({
        body: {
          code: "123456",
        },
        user: {
          _id: "user123",
        },
      });
      const res = createRes();

      User.findById.mockReturnValue({
        populate: vi.fn().mockRejectedValue(new Error("Database error")),
      });

      await verifyEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Database error",
      });
    });
  });

  // =======================================================
  // forgotPassword
  // =======================================================

  describe("forgotPassword", () => {
    it("should return success even when user does not exist", async () => {
      const req = createReq({
        body: {
          email: "unknown@test.com",
        },
      });
      const res = createRes();

      User.findOne.mockResolvedValue(null);

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Password reset link sent to your email",
      });

      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("should create reset token and send email", async () => {
      const req = createReq({
        body: {
          email: "john@test.com",
        },
      });
      const res = createRes();

      const user = {
        email: "john@test.com",
        save: vi.fn().mockResolvedValue(undefined),
      };

      User.findOne.mockResolvedValue(user);

      crypto.randomBytes.mockReturnValue({
        toString: vi.fn().mockReturnValue("reset-token-123"),
      });

      await forgotPassword(req, res);

      expect(crypto.randomBytes).toHaveBeenCalledWith(20);

      expect(user.resetPasswordToken).toBe("reset-token-123");

      expect(user.resetPasswordExpiresAt).toEqual(expect.any(Number));

      expect(user.save).toHaveBeenCalled();

      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        "john@test.com",
        "https://example.com/reset-password/reset-token-123",
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Password reset link sent to your email",
      });
    });

    it("should return 500 when forgotPassword throws an error", async () => {
      const req = createReq({
        body: {
          email: "john@test.com",
        },
      });
      const res = createRes();

      User.findOne.mockRejectedValue(new Error("Database error"));

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Database error",
      });
    });
  });

  // =======================================================
  // resetPassword
  // =======================================================

  describe("resetPassword", () => {
    it("should return 401 when reset token is invalid", async () => {
      const req = createReq({
        params: {
          token: "invalid-token",
        },
        body: {
          password: "new-password",
        },
      });
      const res = createRes();

      User.findOne.mockResolvedValue(null);

      await resetPassword(req, res);

      expect(User.findOne).toHaveBeenCalledWith({
        resetPasswordToken: "invalid-token",
        resetPasswordExpiresAt: {
          $gt: expect.any(Number),
        },
      });

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid or expired reset token",
      });
    });

    it("should reset password successfully", async () => {
      const req = createReq({
        params: {
          token: "valid-token",
        },
        body: {
          password: "new-password",
        },
      });
      const res = createRes();

      const user = {
        email: "john@test.com",
        password: "old-password",
        resetPasswordToken: "valid-token",
        resetPasswordExpiresAt: Date.now() + 100000,
        save: vi.fn().mockResolvedValue(undefined),
      };

      User.findOne.mockResolvedValue(user);

      bcrypt.hash.mockResolvedValue("new-hashed-password");

      await resetPassword(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith("new-password", 10);

      expect(user.password).toBe("new-hashed-password");

      expect(user.resetPasswordToken).toBeUndefined();
      expect(user.resetPasswordExpiresAt).toBeUndefined();

      expect(user.save).toHaveBeenCalled();

      expect(sendResetSuccessEmail).toHaveBeenCalledWith("john@test.com");

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Password reset successful",
      });
    });

    it("should return 500 when resetPassword throws an error", async () => {
      const req = createReq({
        params: {
          token: "valid-token",
        },
        body: {
          password: "new-password",
        },
      });
      const res = createRes();

      User.findOne.mockRejectedValue(new Error("Database error"));

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Database error",
      });
    });
  });

  // =======================================================
  // resendEmailVerification
  // =======================================================

  describe("resendEmailVerification", () => {
    it("should return 403 when user does not exist", async () => {
      const req = createReq({
        user: null,
      });
      const res = createRes();

      await resendEmailVerification(req, res);

      expect(res.status).toHaveBeenCalledWith(403);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found",
      });
    });

    it("should return 403 when email is already verified", async () => {
      const req = createReq({
        user: {
          email: "john@test.com",
          isVerified: true,
        },
      });
      const res = createRes();

      await resendEmailVerification(req, res);

      /*
       * NOTE:
       * Your current controller does NOT have "return" here.
       *
       * Therefore the function continues after sending the
       * 403 response.
       *
       * This test verifies the first response.
       */
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Email already verified",
      });
    });

    it("should resend verification email successfully", async () => {
      const req = createReq({
        user: {
          email: "john@test.com",
          isVerified: false,
          save: vi.fn().mockResolvedValue(undefined),
        },
      });
      const res = createRes();

      await resendEmailVerification(req, res);

      expect(req.user.verificationToken).toBe("550000");

      expect(req.user.verificationTokenExpiresAt).toEqual(expect.any(Number));

      expect(req.user.save).toHaveBeenCalled();

      expect(sendVerificationEmail).toHaveBeenCalledWith(
        "john@test.com",
        "550000",
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Verification email is sent",
      });
    });

    it("should return 500 when resendEmailVerification throws an error", async () => {
      const req = createReq({
        user: {
          email: "john@test.com",
          isVerified: false,
          save: vi.fn().mockRejectedValue(new Error("Database error")),
        },
      });
      const res = createRes();

      await resendEmailVerification(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server internal error",
      });
    });
  });

  // =======================================================
  // changePassword
  // =======================================================

  describe("changePassword", () => {
    it("should return 422 when new password is missing", async () => {
      const req = createReq({
        body: {
          oldPassword: "old-password",
        },
        user: {
          _id: "user123",
        },
      });
      const res = createRes();

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(422);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "New password is needed",
      });

      expect(User.findById).not.toHaveBeenCalled();
    });

    it("should return 403 for clerk user", async () => {
      const req = createReq({
        body: {
          oldPassword: "old-password",
          newPassword: "new-password",
        },
        user: {
          _id: "user123",
        },
      });
      const res = createRes();

      User.findById.mockResolvedValue({
        password: "clerkUser",
      });

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(403);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Password change isn't enabled for this account",
      });
    });

    it("should return 401 when user does not exist", async () => {
      const req = createReq({
        body: {
          oldPassword: "old-password",
          newPassword: "new-password",
        },
        user: {
          _id: "user123",
        },
      });
      const res = createRes();

      User.findById.mockResolvedValue(null);

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid credentials",
      });
    });

    it("should return 401 when old password is incorrect", async () => {
      const req = createReq({
        body: {
          oldPassword: "wrong-password",
          newPassword: "new-password",
        },
        user: {
          _id: "user123",
        },
      });
      const res = createRes();

      User.findById.mockResolvedValue({
        password: "old-hashed-password",
      });

      bcrypt.compare.mockResolvedValue(false);

      await changePassword(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "wrong-password",
        "old-hashed-password",
      );

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid credentials",
      });
    });

    it("should change password successfully", async () => {
      const req = createReq({
        body: {
          oldPassword: "old-password",
          newPassword: "new-password",
        },
        user: {
          _id: "user123",
        },
      });
      const res = createRes();

      const user = {
        email: "john@test.com",
        password: "old-hashed-password",
        save: vi.fn().mockResolvedValue(undefined),
      };

      User.findById.mockResolvedValue(user);

      bcrypt.compare.mockResolvedValue(true);

      bcrypt.hash.mockResolvedValue("new-hashed-password");

      await changePassword(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "old-password",
        "old-hashed-password",
      );

      expect(bcrypt.hash).toHaveBeenCalledWith("new-password", 10);

      expect(user.password).toBe("new-hashed-password");

      expect(user.save).toHaveBeenCalled();

      expect(sendPasswordchangedEmail).toHaveBeenCalledWith("john@test.com");

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Password is changed",
      });
    });

    it("should return 500 when changePassword throws an error", async () => {
      const req = createReq({
        body: {
          oldPassword: "old-password",
          newPassword: "new-password",
        },
        user: {
          _id: "user123",
        },
      });
      const res = createRes();

      User.findById.mockRejectedValue(new Error("Database error"));

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server internal error",
      });
    });
  });

  // =======================================================
  // changeUsername
  // =======================================================

  describe("changeUsername", () => {
    it("should return 422 when name is missing", async () => {
      const req = createReq({
        body: {},
        user: {
          _id: "user123",
        },
      });
      const res = createRes();

      await changeUsername(req, res);

      expect(res.status).toHaveBeenCalledWith(422);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "New username is needed",
      });

      expect(User.findById).not.toHaveBeenCalled();
    });

    it("should return 400 when user does not exist", async () => {
      const req = createReq({
        body: {
          name: "New Name",
        },
        user: {
          _id: "user123",
        },
      });
      const res = createRes();

      User.findById.mockResolvedValue(null);

      await changeUsername(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found",
      });
    });

    it("should return 403 for clerk user", async () => {
      const req = createReq({
        body: {
          name: "New Name",
        },
        user: {
          _id: "user123",
        },
      });
      const res = createRes();

      User.findById.mockResolvedValue({
        password: "clerkUser",
      });

      await changeUsername(req, res);

      expect(res.status).toHaveBeenCalledWith(403);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Username change isn't enabled for this account",
      });
    });

    it("should change username successfully", async () => {
      const req = createReq({
        body: {
          name: "New Name",
        },
        user: {
          _id: "user123",
        },
      });
      const res = createRes();

      const user = {
        name: "Old Name",
        password: "hashed-password",
        save: vi.fn().mockResolvedValue(undefined),
      };

      User.findById.mockResolvedValue(user);

      await changeUsername(req, res);

      expect(user.name).toBe("New Name");

      expect(user.save).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Username is changed",
      });
    });

    it("should return 500 when changeUsername throws an error", async () => {
      const req = createReq({
        body: {
          name: "New Name",
        },
        user: {
          _id: "user123",
        },
      });
      const res = createRes();

      User.findById.mockRejectedValue(new Error("Database error"));

      await changeUsername(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server internal error",
      });
    });
  });

  // =======================================================
  // refresh
  // =======================================================

  describe("refresh", () => {
    it("should return 401 when refresh token is missing", async () => {
      const req = createReq({
        headers: {},
        cookies: {},
      });
      const res = createRes();

      await refresh(req, res);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid credentials",
      });

      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it("should return 401 when Android Authorization token is malformed", async () => {
      const req = createReq({
        headers: {
          "x-client-type": "android-app",
        },
        body: {
          refreshToken: "invalid-format",
        },
      });
      const res = createRes();

      await refresh(req, res);

      expect(jwt.verify).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid credentials",
      });
    });

    it("should refresh token successfully using cookies", async () => {
      const req = createReq({
        headers: {},
        cookies: {
          refreshToken: "refresh-token-123",
        },
      });
      const res = createRes();

      jwt.verify.mockReturnValue({
        userId: "user123",
      });

      redis.get.mockResolvedValue("refresh-token-123");

      await refresh(req, res);

      expect(jwt.verify).toHaveBeenCalledWith(
        "refresh-token-123",
        "test-secret",
      );

      expect(redis.get).toHaveBeenCalledWith("refresh_token:user123");

      expect(generateToken).toHaveBeenCalledWith(req, res, "user123");

      expect(generateRefreshToken).toHaveBeenCalledWith(req, res, "user123");

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Token refreshed successfully",
      });
    });

    it("should refresh token successfully for Android app", async () => {
      const req = createReq({
        headers: {
          "x-client-type": "android-app",
        },
        body: {
          refreshToken: "Bearer refresh-token-123",
        },
      });
      const res = createRes();

      jwt.verify.mockReturnValue({
        userId: "user123",
      });

      redis.get.mockResolvedValue("refresh-token-123");

      await refresh(req, res);

      expect(jwt.verify).toHaveBeenCalledWith(
        "refresh-token-123",
        "test-secret",
      );

      expect(generateToken).toHaveBeenCalledWith(req, res, "user123");

      expect(generateRefreshToken).toHaveBeenCalledWith(req, res, "user123");

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Token refreshed successfully",
      });
    });

    it("should return 401 when stored refresh token does not match", async () => {
      const req = createReq({
        cookies: {
          refreshToken: "refresh-token-123",
        },
      });
      const res = createRes();

      jwt.verify.mockReturnValue({
        userId: "user123",
      });

      redis.get.mockResolvedValue("different-token");

      await refresh(req, res);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid credentials",
      });

      expect(generateToken).not.toHaveBeenCalled();
      expect(generateRefreshToken).not.toHaveBeenCalled();
    });

    it("should return 500 when jwt.verify throws an error", async () => {
      const req = createReq({
        cookies: {
          refreshToken: "bad-token",
        },
      });
      const res = createRes();

      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await refresh(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server internal error",
      });
    });
  });

  // =======================================================
  // deleteAccount
  // =======================================================

  describe("deleteAccount", () => {
    it("should delete account successfully", async () => {
      const req = createReq({
        user: {
          _id: "user123",
        },
      });
      const res = createRes();

      const user = {
        _id: "user123",
      };

      User.findById.mockResolvedValue(user);
      redis.del.mockResolvedValue(1);
      User.findByIdAndDelete.mockResolvedValue(user);

      await deleteAccount(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");

      expect(redis.del).toHaveBeenCalledWith("refresh_token:user123");

      expect(User.findByIdAndDelete).toHaveBeenCalledWith("user123");

      expect(res.clearCookie).toHaveBeenCalledWith("token");

      expect(res.clearCookie).toHaveBeenCalledWith(
        "refreshToken",
        expect.any(Object),
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Logged out successfully",
      });
    });

    it("should return 500 when deleteAccount throws an error", async () => {
      const req = createReq({
        user: {
          _id: "user123",
        },
      });
      const res = createRes();

      User.findById.mockRejectedValue(new Error("Database error"));

      await deleteAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server internal error",
      });
    });
  });
});
