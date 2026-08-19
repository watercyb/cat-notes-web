import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
}));

vi.mock("mailtrap", () => ({
  MailtrapClient: class {
    send(...args) {
      return sendMock(...args);
    }
  },
}));

vi.mock("dotenv", () => ({
  default: {
    config: vi.fn(),
  },
}));

vi.mock("../../../mails/emailTemplates.js", () => ({
  getPasswordchangedEmailTempale: vi.fn(() => "<html>changed</html>"),
  getPasswordResetEmailTempale: vi.fn(() => "<html>reset</html>"),
  getPasswordResetSuccessEmailTempale: vi.fn(() => "<html>success</html>"),
  getVerificationEmailTempale: vi.fn(() => "<html>verification</html>"),
  getWelcomeEmailTempale: vi.fn(() => "<html>welcome</html>"),
}));

import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendPasswordchangedEmail,
  getMailCount,
} from "../../../mails/mailtrap.js";

import {
  getPasswordchangedEmailTempale,
  getPasswordResetEmailTempale,
  getPasswordResetSuccessEmailTempale,
  getVerificationEmailTempale,
  getWelcomeEmailTempale,
} from "../../../mails/emailTemplates.js";

describe("mailtrap", () => {
  let consoleErrorSpy;
  let consoleLogSpy;

  beforeEach(() => {
    vi.clearAllMocks();

    sendMock.mockResolvedValue({ success: true });

    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe("sendVerificationEmail", () => {
    it("should send a verification email", async () => {
      await sendVerificationEmail("john@test.com", "abc123");

      expect(sendMock).toHaveBeenCalledWith({
        from: {
          email: "notes@bbjdev.com",
          name: "Cat Notes",
        },
        to: [{ email: "john@test.com" }],
        subject: "Verify your email",
        html: "<html>verification</html>",
        category: "Email Verification",
      });

      expect(getVerificationEmailTempale).toHaveBeenCalledWith("abc123");
    });

    it("should increase mail count when email is sent successfully", async () => {
      const countBefore = getMailCount();

      await sendVerificationEmail("john@test.com", "abc123");

      expect(getMailCount()).toBe(countBefore + 1);
    });

    it("should log and throw when sending fails", async () => {
      const error = new Error("Mailtrap error");

      sendMock.mockRejectedValueOnce(error);

      await expect(
        sendVerificationEmail("john@test.com", "abc123"),
      ).rejects.toThrow(
        "Error sending verification email: Error: Mailtrap error",
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error sending verification email",
        error,
      );

      expect(getMailCount()).toBeGreaterThanOrEqual(0);
    });
  });

  describe("sendWelcomeEmail", () => {
    it("should send a welcome email", async () => {
      process.env.RENDER_EXTERNAL_URL = "https://catnotes.com";

      await sendWelcomeEmail("john@test.com", "John", "https://catnotes.com");

      expect(sendMock).toHaveBeenCalledWith({
        from: {
          email: "notes@bbjdev.com",
          name: "Cat Notes",
        },
        to: [{ email: "john@test.com" }],
        subject: "Welcome to Cat Notes",
        html: "<html>welcome</html>",
        category: "Welcome",
      });

      expect(getWelcomeEmailTempale).toHaveBeenCalledWith(
        "https://catnotes.com",
      );
    });

    it("should increase mail count when email is sent successfully", async () => {
      const countBefore = getMailCount();

      await sendWelcomeEmail("john@test.com", "John", "https://catnotes.com");

      expect(getMailCount()).toBe(countBefore + 1);
    });

    it("should log and throw when sending fails", async () => {
      const error = new Error("Mailtrap error");

      sendMock.mockRejectedValueOnce(error);

      await expect(
        sendWelcomeEmail("john@test.com", "John", "https://catnotes.com"),
      ).rejects.toThrow("Error sending welcome email: Error: Mailtrap error");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error sending welcome email",
        error,
      );
    });
  });

  describe("sendPasswordResetEmail", () => {
    it("should send a password reset email", async () => {
      await sendPasswordResetEmail(
        "john@test.com",
        "https://catnotes.com/reset/abc123",
      );

      expect(sendMock).toHaveBeenCalledWith({
        from: {
          email: "notes@bbjdev.com",
          name: "Cat Notes",
        },
        to: [{ email: "john@test.com" }],
        subject: "Reset your password",
        html: "<html>reset</html>",
        category: "Password Reset",
      });

      expect(getPasswordResetEmailTempale).toHaveBeenCalledWith(
        "https://catnotes.com/reset/abc123",
      );
    });

    it("should log and throw when sending fails", async () => {
      const error = new Error("Mailtrap error");

      sendMock.mockRejectedValueOnce(error);

      await expect(
        sendPasswordResetEmail(
          "john@test.com",
          "https://catnotes.com/reset/abc123",
        ),
      ).rejects.toThrow(
        "Error sending password reset email: Error: Mailtrap error",
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error sending password reset email",
        error,
      );
    });
  });

  describe("sendResetSuccessEmail", () => {
    it("should send a password reset success email", async () => {
      await sendResetSuccessEmail("john@test.com");

      expect(sendMock).toHaveBeenCalledWith({
        from: {
          email: "notes@bbjdev.com",
          name: "Cat Notes",
        },
        to: [{ email: "john@test.com" }],
        subject: "Password Reset Successful",
        html: "<html>success</html>",
        category: "Password Reset",
      });

      expect(getPasswordResetSuccessEmailTempale).toHaveBeenCalled();
    });

    it("should log and throw when sending fails", async () => {
      const error = new Error("Mailtrap error");

      sendMock.mockRejectedValueOnce(error);

      await expect(sendResetSuccessEmail("john@test.com")).rejects.toThrow(
        "Error sending password reset succes email: Error: Mailtrap error",
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error sending password reset succes email",
        error,
      );
    });
  });

  describe("sendPasswordchangedEmail", () => {
    it("should send a password changed email", async () => {
      await sendPasswordchangedEmail("john@test.com");

      expect(sendMock).toHaveBeenCalledWith({
        from: {
          email: "notes@bbjdev.com",
          name: "Cat Notes",
        },
        to: [{ email: "john@test.com" }],
        subject: "Password Reset Successful",
        html: "<html>changed</html>",
        category: "Password Reset",
      });

      expect(getPasswordchangedEmailTempale).toHaveBeenCalled();
    });

    it("should log and throw when sending fails", async () => {
      const error = new Error("Mailtrap error");

      sendMock.mockRejectedValueOnce(error);

      await expect(sendPasswordchangedEmail("john@test.com")).rejects.toThrow(
        "Error sending password changed email: Error: Mailtrap error",
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error sending password changed email",
        error,
      );
    });
  });

  describe("getMailCount", () => {
    it("should return the current mail count", () => {
      expect(getMailCount()).toBeGreaterThanOrEqual(0);
    });
  });
});
