import User from "../models/user_model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";
import {
  sendPasswordchangedEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../mails/mailtrap.js";
import crypto from "crypto";

export const signup = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(422)
        .json({ success: false, message: "All fields are required" });

    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    if (!name || !email || !password)
      return res
        .status(422)
        .json({ success: false, message: "All fields are required" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    generateToken(req, res, user._id);
    delete user.password;

    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        name: user.name,
        email: user.email,
        notes: user.notes,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.log("Error in signup: ", error.message);
    res.status(500).json({ success: false, message: "Server internal error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("notes");
    if (user?.password === "clerkUser")
      return res.status(400).json({
        success: false,
        message: "Password login isn't enabled for this account",
      });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    generateToken(req, res, user._id);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        name: user.name,
        email: user.email,
        notes: user.notes,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.log("Error in login: ", error.message);
    res.status(500).json({ success: false, message: "Server internal error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout: ", error.message);
    res.status(500).json({ success: false, message: "Server internal error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("notes");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        notes: user.notes,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.log("Error in checkAuth ", error);
    res.status(500).json({ success: false, message: "Server internal error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;
    const user = req.user;

    if (
      !user ||
      user.verificationToken != code ||
      user.verificationTokenExpiresAt < Date.now()
    )
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        name: user.name,
        email: user.email,
        notes: user.notes,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.log("Error in verifyEmail: ", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();
    await sendPasswordResetEmail(
      user.email,
      `${process.env.RENDER_EXTERNAL_URL}/reset-password/${resetToken}`,
    );

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.log("Error in forgotPassword: ", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log("Error in resetPassword: ", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resendEmailVerification = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    if (user.isVerified)
      res
        .status(400)
        .json({ success: false, message: "Email already verified" });

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

    user.save();

    await sendVerificationEmail(user.email, verificationToken);

    res.status(200).json({
      success: true,
      message: "Verification email is sent",
    });
  } catch (error) {
    console.log("Error in resendEmailVerification: ", error.message);
    res.status(500).json({ success: false, message: "Server internal error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!newPassword)
      return res.status(400).json({
        success: false,
        message: "New password is needed",
      });

    const user = await User.findById(user._id);
    if (user?.password === "clerkUser")
      return res.status(400).json({
        success: false,
        message: "Password change isn't enabled for this account",
      });
    if (!user || !(await bcrypt.compare(oldPassword, user.password)))
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await sendPasswordchangedEmail(user.email);

    res.status(200).json({
      success: true,
      message: "Password is changed",
    });
  } catch (error) {
    console.log("Error in changePassword: ", error.message);
    res.status(500).json({ success: false, message: "Server internal error" });
  }
};

export const changeUsername = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name)
      return res.status(400).json({
        success: false,
        message: "New username is needed",
      });

    const user = await User.findById(req.user?._id);
    if (!user)
      return res.status(400).json({
        success: false,
        message: "User not found",
      });

    if (user?.password === "clerkUser")
      return res.status(400).json({
        success: false,
        message: "Username change isn't enabled for this account",
      });

    user.name = name;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Username is changed",
    });
  } catch (error) {
    console.log("Error in changeUsername: ", error.message);
    res.status(500).json({ success: false, message: "Server internal error" });
  }
};
