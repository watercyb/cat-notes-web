import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import request from "supertest";
import mongoose from "mongoose";

import app from "../../app.js";
import Note from "../../models/note_model.js";
import User from "../../models/user_model.js";

// --------------------------------------------------
// Mock external services
// --------------------------------------------------

vi.mock("../../mails/mailtrap.js", () => ({
  sendPasswordchangedEmail: vi.fn().mockResolvedValue(),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(),
  sendResetSuccessEmail: vi.fn().mockResolvedValue(),
  sendVerificationEmail: vi.fn().mockResolvedValue(),
  sendWelcomeEmail: vi.fn().mockResolvedValue(),
}));

// Redis is an external service.
// Mock it so this test only needs MongoDB.
vi.mock("../../db/redis.js", () => ({
  redis: {
    del: vi.fn().mockResolvedValue(1),
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
  },

  checkLimit: vi.fn().mockResolvedValue({
    success: true,
  }),

  checkLimitSignup: vi.fn().mockResolvedValue({
    success: true,
  }),

  checkLimitResetPassword: vi.fn().mockResolvedValue({
    success: true,
  }),
}));

let consoleLogSpy;
let consoleErrorSpy;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);

  process.env.RENDER_EXTERNAL_URL = "http://localhost:3000";
  process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
});

beforeEach(async () => {
  await Note.deleteMany({});
  await User.deleteMany({});

  process.env.NODE_ENV = "development";

  consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(async () => {
  await Note.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

afterEach(() => {
  consoleLogSpy.mockRestore();
  consoleErrorSpy.mockRestore();
});

// ==================================================
// signup
// ==================================================

describe("POST /api/auth/signup", () => {
  it("should create a new user", async () => {
    const response = await request(app).post("/api/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(response.status).toBe(201);

    expect(response.body).toEqual({
      success: true,
      message: "User created successfully",
      user: expect.objectContaining({
        name: "Test User",
        email: "test@example.com",
      }),
    });

    const user = await User.findOne({
      email: "test@example.com",
    });

    expect(user).not.toBeNull();
    expect(user.name).toBe("Test User");

    // Password should be hashed.
    expect(user.password).not.toBe("password123");

    // Verification token should exist.
    expect(user.verificationToken).toBeDefined();
    expect(user.verificationToken).toHaveLength(6);
  });

  it("should reject duplicate email", async () => {
    await User.create({
      name: "Existing User",
      email: "test@example.com",
      password: "password123",
    });

    const response = await request(app).post("/api/auth/signup").send({
      name: "Another User",
      email: "test@example.com",
      password: "anotherpassword",
    });

    expect(response.status).toBe(409);

    expect(response.body).toEqual({
      success: false,
      message: "User already exists",
    });
  });

  it("should reject missing fields", async () => {
    const response = await request(app).post("/api/auth/signup").send({
      name: "Test User",
    });

    expect(response.status).toBe(422);

    expect(response.body).toEqual({
      success: false,
      message: "All fields are required",
    });
  });
});

// ==================================================
// login
// ==================================================

describe("POST /api/auth/login", () => {
  it("should login with correct credentials", async () => {
    await request(app).post("/api/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "Logged in successfully",
      user: expect.objectContaining({
        name: "Test User",
        email: "test@example.com",
      }),
    });

    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("should reject incorrect password", async () => {
    await request(app).post("/api/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid credentials",
    });
  });

  it("should reject nonexistent user", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "doesnotexist@example.com",
      password: "password123",
    });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid credentials",
    });
  });
});

// ==================================================
// check-auth
// ==================================================

describe("GET /api/auth/check-auth", () => {
  it("should return authenticated user", async () => {
    const agent = request.agent(app);

    await agent.post("/api/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    const res = await agent.post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    const response = await agent.get("/api/auth/check-auth");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      user: expect.objectContaining({
        name: "Test User",
        email: "test@example.com",
      }),
    });
  });
});

// ==================================================
// logout
// ==================================================

describe("POST /api/auth/logout", () => {
  it("should logout successfully", async () => {
    const agent = request.agent(app);

    await agent.post("/api/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    await agent.post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    const response = await agent.post("/api/auth/logout");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "Logged out successfully",
    });
  });
});

// ==================================================
// verify-email
// ==================================================

describe("POST /api/auth/verify-email", () => {
  it("should verify email with correct verification code", async () => {
    const signupResponse = await request(app).post("/api/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(signupResponse.status).toBe(201);

    const userBefore = await User.findOne({
      email: "test@example.com",
    });

    const verificationToken = userBefore.verificationToken;

    const agent = request.agent(app);

    // Login to get authentication cookie.
    await agent.post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    const response = await agent.post("/api/auth/verify-email").send({
      code: verificationToken,
    });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "Email verified successfully",
      user: expect.objectContaining({
        email: "test@example.com",
        isVerified: true,
      }),
    });

    const userAfter = await User.findOne({
      email: "test@example.com",
    });

    expect(userAfter.isVerified).toBe(true);
    expect(userAfter.verificationToken).toBeUndefined();
  });

  it("should reject invalid verification code", async () => {
    await request(app).post("/api/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    const agent = request.agent(app);

    await agent.post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    const response = await agent.post("/api/auth/verify-email").send({
      code: "000000",
    });

    expect(response.status).toBe(403);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid or expired verification code",
    });
  });
});

// ==================================================
// resend-email
// ==================================================

describe("POST /api/auth/resend-email", () => {
  it("should resend verification email", async () => {
    await request(app).post("/api/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    const agent = request.agent(app);

    await agent.post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    const oldUser = await User.findOne({
      email: "test@example.com",
    });

    const oldToken = oldUser.verificationToken;

    const response = await agent.post("/api/auth/resend-email");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "Verification email is sent",
    });

    const newUser = await User.findOne({
      email: "test@example.com",
    });

    expect(newUser.verificationToken).toBeDefined();
    expect(newUser.verificationToken).not.toBe(oldToken);
  });
});

// ==================================================
// forgot-password
// ==================================================

describe("POST /api/auth/forgot-password", () => {
  it("should create a password reset token", async () => {
    await request(app).post("/api/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    const response = await request(app).post("/api/auth/forgot-password").send({
      email: "test@example.com",
    });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "Password reset link sent to your email",
    });

    const user = await User.findOne({
      email: "test@example.com",
    });

    expect(user.resetPasswordToken).toBeDefined();
    expect(user.resetPasswordExpiresAt).toBeDefined();
  });

  it("should return success even when user does not exist", async () => {
    const response = await request(app).post("/api/auth/forgot-password").send({
      email: "doesnotexist@example.com",
    });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "Password reset link sent to your email",
    });
  });
});

// ==================================================
// reset-password
// ==================================================

describe("POST /api/auth/reset-password/:token", () => {
  it("should reset the password with a valid token", async () => {
    await request(app).post("/api/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "oldpassword",
    });

    const user = await User.findOne({
      email: "test@example.com",
    });

    user.resetPasswordToken = "test-reset-token";
    user.resetPasswordExpiresAt = Date.now() + 60 * 60 * 1000;

    await user.save();

    const response = await request(app)
      .post("/api/auth/reset-password/test-reset-token")
      .send({
        password: "newpassword",
      });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "Password reset successful",
    });

    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "newpassword",
    });

    expect(loginResponse.status).toBe(200);
  });

  it("should reject an invalid reset token", async () => {
    const response = await request(app)
      .post("/api/auth/reset-password/invalid-token")
      .send({
        password: "newpassword",
      });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid or expired reset token",
    });
  });
});

// ==================================================
// password
// ==================================================

describe("POST /api/auth/password", () => {
  it("should change the password", async () => {
    await request(app).post("/api/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "oldpassword",
    });

    const agent = request.agent(app);

    await agent.post("/api/auth/login").send({
      email: "test@example.com",
      password: "oldpassword",
    });

    const response = await agent.post("/api/auth/password").send({
      oldPassword: "oldpassword",
      newPassword: "newpassword",
    });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "Password is changed",
    });

    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "newpassword",
    });

    expect(loginResponse.status).toBe(200);
  });

  it("should reject when new password is missing", async () => {
    await request(app).post("/api/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "oldpassword",
    });

    const agent = request.agent(app);

    await agent.post("/api/auth/login").send({
      email: "test@example.com",
      password: "oldpassword",
    });

    const response = await agent.post("/api/auth/password").send({
      oldPassword: "oldpassword",
    });

    expect(response.status).toBe(422);

    expect(response.body).toEqual({
      success: false,
      message: "New password is needed",
    });
  });

  it("should reject an incorrect old password", async () => {
    await request(app).post("/api/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "oldpassword",
    });

    const agent = request.agent(app);

    await agent.post("/api/auth/login").send({
      email: "test@example.com",
      password: "oldpassword",
    });

    const response = await agent.post("/api/auth/password").send({
      oldPassword: "wrongpassword",
      newPassword: "newpassword",
    });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid credentials",
    });
  });
});

// ==================================================
// username
// ==================================================

describe("POST /api/auth/username", () => {
  it("should change the username", async () => {
    await request(app).post("/api/auth/signup").send({
      name: "Old Name",
      email: "test@example.com",
      password: "password123",
    });

    const agent = request.agent(app);

    await agent.post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    const response = await agent.post("/api/auth/username").send({
      name: "New Name",
    });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "Username is changed",
    });

    const user = await User.findOne({
      email: "test@example.com",
    });

    expect(user.name).toBe("New Name");
  });

  it("should reject a missing username", async () => {
    await request(app).post("/api/auth/signup").send({
      name: "Old Name",
      email: "test@example.com",
      password: "password123",
    });

    const agent = request.agent(app);

    await agent.post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    const response = await agent.post("/api/auth/username").send({});

    expect(response.status).toBe(422);

    expect(response.body).toEqual({
      success: false,
      message: "New username is needed",
    });
  });
});

// ==================================================
// refresh
// ==================================================

describe("POST /api/auth/refresh", () => {
  it("should reject when refresh token is missing", async () => {
    const response = await request(app).post("/api/auth/refresh");

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid credentials",
    });
  });
});

// ==================================================
// delete account
// ==================================================

describe("DELETE /api/auth/", () => {
  it("should delete the authenticated user", async () => {
    await request(app).post("/api/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    const agent = request.agent(app);

    await agent.post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    const response = await agent.delete("/api/auth/");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "Logged out successfully",
    });

    const user = await User.findOne({
      email: "test@example.com",
    });

    expect(user).toBeNull();
  });
});
