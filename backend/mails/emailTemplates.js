import fs from "fs";
import path from "path";

export const getVerificationEmailTempale = (verificationCode) => {
  const templatePath = path.join(
    process.cwd(),
    "backend",
    "emails",
    "verification_email.html",
  );
  let html = fs.readFileSync(templatePath, "utf8");
  html = html.replace("{{verificationCode}}", verificationCode);
  return html;
};

export const getPasswordResetSuccessEmailTempale = () => {
  const templatePath = path.join(
    process.cwd(),
    "backend",
    "emails",
    "password_reset_success.html",
  );
  let html = fs.readFileSync(templatePath, "utf8");
  return html;
};

export const getPasswordResetEmailTempale = (resetURL) => {
 const templatePath = path.join(
    process.cwd(),
    "backend",
    "emails",
    "password_reset.html",
  );
  let html = fs.readFileSync(templatePath, "utf8");
  html = html.replaceAll("{{resetURL}}", resetURL);
  return html;
};

export const getWelcomeEmailTempale = (appUrl) => {
 const templatePath = path.join(
    process.cwd(),
    "backend",
    "emails",
    "welcome.html",
  );
  let html = fs.readFileSync(templatePath, "utf8");
  html = html.replace("{{appUrl}}", appUrl);
  return html;
};
