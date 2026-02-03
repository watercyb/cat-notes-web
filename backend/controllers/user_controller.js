import User from "../models/user_model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";

export const signup = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = (
      await User.create({
        email,
        password: hashedPassword,
        name,
      })
    ).toJSON();

    generateToken(res, user._id);
    delete user.password;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.log("Error in signup: ", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    generateToken(res, user._id);

    const userJSON = user.toJSON();
    delete userJSON.password;

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: userJSON,
    });
  } catch (error) {
    console.log("Error in login: ", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout: ", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in checkAuth ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
