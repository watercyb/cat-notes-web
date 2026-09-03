import { MailtrapClient } from "mailtrap";
import {
  getPasswordchangedEmailTempale,
  getPasswordResetEmailTempale,
  getPasswordResetSuccessEmailTempale,
  getVerificationEmailTempale,
  getWelcomeEmailTempale,
} from "./emailTemplates.js";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

let mailCount = 0;

const client = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN,
  //sandbox: true,
  //testInboxId: 4419367
});

const sender = {
  email: "notes@bbjdev.com",
  name: "Cat Notes",
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

    mailCount++;
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
      subject: "Welcome to Cat Notes",
      html: getWelcomeEmailTempale(process.env.RENDER_EXTERNAL_URL),
      category: "Welcome",
    });

    mailCount++;
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

    mailCount++;
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

    mailCount++;
    console.log("Email sent successfully", response);
  } catch (error) {
    console.error("Error sending password reset succes email", error);
    throw new Error(`Error sending password reset succes email: ${error}`);
  }
};

export const sendPasswordchangedEmail = async (email) => {
  try {
    const response = await client.send({
      from: sender,
      to: [{ email }],
      subject: "Password Reset Successful",
      html: getPasswordchangedEmailTempale(),
      category: "Password Reset",
    });

    mailCount++;
    console.log("Email sent successfully", response);
  } catch (error) {
    console.error("Error sending password changed email", error);
    throw new Error(`Error sending password changed email: ${error}`);
  }
};

export const getMailCount = () => {
  return mailCount;
};
