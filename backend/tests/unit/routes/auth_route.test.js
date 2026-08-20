import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockControllers, mockMiddleware } = vi.hoisted(() => ({
  mockControllers: {
    changePassword: vi.fn(),
    changeUsername: vi.fn(),
    checkAuth: vi.fn(),
    deleteAccount: vi.fn(),
    forgotPassword: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    resendEmailVerification: vi.fn(),
    resetPassword: vi.fn(),
    signup: vi.fn(),
    verifyEmail: vi.fn(),
  },

  mockMiddleware: {
    rateCheckResetPassword: vi.fn(),
    rateCheckSignup: vi.fn(),
    verifyToken: vi.fn(),
  },
}));

vi.mock("../../../controllers/user_controller.js", () => mockControllers);

vi.mock("../../../middleware/middleware.js", () => mockMiddleware);

import router from "../../../routes/auth_route.js";

describe("auth_route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should register POST /signup", () => {
    const route = router.stack.find(
      (layer) => layer.route?.path === "/signup" && layer.route?.methods.post,
    );

    expect(route).toBeDefined();
    expect(route.route.stack).toHaveLength(2);

    expect(route.route.stack[0].handle).toBe(mockMiddleware.rateCheckSignup);

    expect(route.route.stack[1].handle).toBe(mockControllers.signup);
  });

  it("should register POST /login", () => {
    const route = router.stack.find(
      (layer) => layer.route?.path === "/login" && layer.route?.methods.post,
    );

    expect(route).toBeDefined();
    expect(route.route.stack[0].handle).toBe(mockControllers.login);
  });

  it("should register POST /logout", () => {
    const route = router.stack.find(
      (layer) => layer.route?.path === "/logout" && layer.route?.methods.post,
    );

    expect(route).toBeDefined();
    expect(route.route.stack[0].handle).toBe(mockControllers.logout);
  });

  it("should register GET /check-auth with verifyToken", () => {
    const route = router.stack.find(
      (layer) =>
        layer.route?.path === "/check-auth" && layer.route?.methods.get,
    );

    expect(route).toBeDefined();
    expect(route.route.stack[0].handle).toBe(mockMiddleware.verifyToken);
    expect(route.route.stack[1].handle).toBe(mockControllers.checkAuth);
  });

  it("should register POST /verify-email with verifyToken", () => {
    const route = router.stack.find(
      (layer) =>
        layer.route?.path === "/verify-email" && layer.route?.methods.post,
    );

    expect(route).toBeDefined();
    expect(route.route.stack[0].handle).toBe(mockMiddleware.verifyToken);
    expect(route.route.stack[1].handle).toBe(mockControllers.verifyEmail);
  });

  it("should register POST /resend-email with rateCheckSignup and verifyToken", () => {
    const route = router.stack.find(
      (layer) =>
        layer.route?.path === "/resend-email" && layer.route?.methods.post,
    );

    expect(route).toBeDefined();

    expect(route.route.stack[0].handle).toBe(mockMiddleware.rateCheckSignup);

    expect(route.route.stack[1].handle).toBe(mockMiddleware.verifyToken);

    expect(route.route.stack[2].handle).toBe(
      mockControllers.resendEmailVerification,
    );
  });

  it("should register POST /forgot-password with rateCheckResetPassword", () => {
    const route = router.stack.find(
      (layer) =>
        layer.route?.path === "/forgot-password" && layer.route?.methods.post,
    );

    expect(route).toBeDefined();

    expect(route.route.stack[0].handle).toBe(
      mockMiddleware.rateCheckResetPassword,
    );

    expect(route.route.stack[1].handle).toBe(mockControllers.forgotPassword);
  });

  it("should register POST /reset-password/:token", () => {
    const route = router.stack.find(
      (layer) =>
        layer.route?.path === "/reset-password/:token" &&
        layer.route?.methods.post,
    );

    expect(route).toBeDefined();
    expect(route.route.stack[0].handle).toBe(mockControllers.resetPassword);
  });

  it("should register POST /password with verifyToken and rateCheckSignup", () => {
    const route = router.stack.find(
      (layer) => layer.route?.path === "/password" && layer.route?.methods.post,
    );

    expect(route).toBeDefined();

    expect(route.route.stack[0].handle).toBe(mockMiddleware.verifyToken);

    expect(route.route.stack[1].handle).toBe(mockMiddleware.rateCheckSignup);

    expect(route.route.stack[2].handle).toBe(mockControllers.changePassword);
  });

  it("should register POST /username with verifyToken", () => {
    const route = router.stack.find(
      (layer) => layer.route?.path === "/username" && layer.route?.methods.post,
    );

    expect(route).toBeDefined();

    expect(route.route.stack[0].handle).toBe(mockMiddleware.verifyToken);

    expect(route.route.stack[1].handle).toBe(mockControllers.changeUsername);
  });

  it("should register POST /refresh", () => {
    const route = router.stack.find(
      (layer) => layer.route?.path === "/refresh" && layer.route?.methods.post,
    );

    expect(route).toBeDefined();
    expect(route.route.stack[0].handle).toBe(mockControllers.refresh);
  });

  it("should register DELETE / with verifyToken", () => {
    const route = router.stack.find(
      (layer) => layer.route?.path === "/" && layer.route?.methods.delete,
    );

    expect(route).toBeDefined();

    expect(route.route.stack[0].handle).toBe(mockMiddleware.verifyToken);

    expect(route.route.stack[1].handle).toBe(mockControllers.deleteAccount);
  });
});
