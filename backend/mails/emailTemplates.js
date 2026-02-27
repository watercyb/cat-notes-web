export const getVerificationEmailTempale = (verificationCode) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Verify Your Email</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>Thank you for signing up! Your verification code is:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">${verificationCode}</span>
    </div>
    <p>Enter this code on the verification page to complete your registration.</p>
    <p>This code will expire in 15 minutes for security reasons.</p>
    <p>If you didn't create an account with us, please ignore this email.</p>
    <p>Best regards,<br>The Cat Notes Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;
};

export const getPasswordResetSuccessEmailTempale = () => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset Successful</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We're writing to confirm that your password has been successfully reset.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #4CAF50; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
        ✓
      </div>
    </div>
    <p>If you did not initiate this password reset, please contact our support team immediately.</p>
    <p>For security reasons, we recommend that you:</p>
    <ul>
      <li>Use a strong, unique password</li>
      <li>Enable two-factor authentication if available</li>
      <li>Avoid using the same password across multiple sites</li>
    </ul>
    <p>Thank you for helping us keep your account secure.</p>
    <p>Best regards,<br>The Cat Notes Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;
};

export const getPasswordResetEmailTempale = (resetURL) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetURL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
    </div>
    <p>This link will expire in 1 hour for security reasons.</p>
    <p>Best regards,<br>The Cat Notes Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;
};

export const getWelcomeEmailTempale = (appUrl) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Cat Notes</title>
</head>

<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,sans-serif;">

  <table align="center" width="100%" cellpadding="0" cellspacing="0" 
         style="max-width:600px;margin-top:30px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">

    <!-- Header -->
    <tr>
      <td style="background:linear-gradient(to right,#4CAF50,#45a049);padding:20px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;">🐾 Welcome to Cat Notes</h1>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:30px;color:#333333;line-height:1.6;">
        <h2 style="margin-top:0;">Hi there 👋</h2>

        <p>
          Thank you for signing up for <strong>Cat Notes</strong>!
        </p>

        <p>
          Your account has been successfully created and you're now ready to start organizing 
          your thoughts, tasks, and ideas in one safe and simple place.
        </p>

        <p>
          With Cat Notes you can:
        </p>

        <ul>
          <li>📒 Create and manage notes easily</li>
          <li>☁️ Sync across all your devices</li>
          <li>🔒 Keep your information secure</li>
          <li>⚡ Access your notes anytime, anywhere</li>
        </ul>

        <div style="text-align:center;margin:30px 0;">
          <a href="${appUrl}" 
             style="background:#4CAF50;color:white;padding:12px 24px;text-decoration:none;
             border-radius:5px;font-weight:bold;display:inline-block;">
             Open Cat Notes
          </a>
        </div>

        <p>
          If you have any questions or need help, feel free to contact our support team anytime.
        </p>

        <p>
          Happy note-taking! 🐱
        </p>

        <p>
          Best regards,<br>
          The Cat Notes Team
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#f9f9f9;padding:15px;text-align:center;font-size:12px;color:#888;">
        This is an automated email. Please do not reply.<br>
        © 2026 Cat Notes
      </td>
    </tr>

  </table>

</body>
</html>
`;
};
