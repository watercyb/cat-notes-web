import { MailtrapClient } from "mailtrap";
import {
  getPasswordResetEmailTempale,
  getPasswordResetSuccessEmailTempale,
  getVerificationEmailTempale,
} from "./emailTemplates.js";
import dotenv from "dotenv";

dotenv.config();

const client = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN,
  sandbox: true,
  testInboxId: 4332346,
});

const sender = {
  email: "hello@demomailtrap.co",
  name: "Mailtrap Test",
};

export const sendVerificationEmail = async (email, token) => {
  try {
    const response = await client.send({
      from: sender,
      to: [{ email }],
      subject: "Verify your email",
      html: getVerificationEmailTempale(token),
      category: "Email Verification",
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    console.error("Error sending verification email", error);
    throw new Error(`Error sending verification email: ${error}`);
  }
};

export const sendWelcomeEmail = async (email, name, url) => {
  try {
    const response = await client.send({
      from: sender,
      to: [{ email }],
      template_uuid: "0c3bd8d0-546b-47fe-a1f4-84d19b6414ab",
      template_variables: {
        company_info_name: "Auth Company",
        name,
        url,
      },
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    console.error("Error sending welcome email", error);
    throw new Error(`Error sending welcome email: ${error}`);
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  try {
    const response = await client.send({
      from: sender,
      to: [{ email }],
      subject: "Reset your password",
      html: getPasswordResetEmailTempale(resetURL),
      category: "Password Reset",
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    console.error("Error sending password reset email", error);
    throw new Error(`Error sending password reset email: ${error}`);
  }
};

export const sendResetSuccessEmail = async (email) => {
  try {
    const response = await client.send({
      from: sender,
      to: [{ email }],
      subject: "Password Reset Successful",
      html: getPasswordResetSuccessEmailTempale(),
      category: "Password Reset",
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    console.error("Error sending password reset succes email", error);
    throw new Error(`Error sending password reset succes email: ${error}`);
  }
};
