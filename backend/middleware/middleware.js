import {
  checkLimit,
  checkLimitResetPassword,
  checkLimitSignup,
} from "../db/redis.js";
import User from "../models/user_model.js";
import jwt from "jsonwebtoken";
import { clerkClient } from "@clerk/express";

export const rateCheck = async (req, res, next) => {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    const rate = await checkLimit(ip);
    if (rate.success) {
      next();
    } else {
      res.status(429).json({ success: false, message: "Too many requests" });
    }
  } catch (error) {
    console.log("Error in ratecheck: ", error);
    res.status(500).json({ success: false, message: "Server internal error" });
  }
};

export const rateCheckSignup = async (req, res, next) => {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    const rate = await checkLimitSignup(ip);
    if (rate.success) {
      next();
    } else {
      res.status(429).json({ success: false, message: "Too many requests" });
    }
  } catch (error) {
    console.log("Error in ratecheck: ", error);
    res.status(500).json({ success: false, message: "Server internal error" });
  }
};

export const rateCheckResetPassword = async (req, res, next) => {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    const rate = await checkLimitResetPassword(ip);
    if (rate.success) {
      next();
    } else {
      res.status(429).json({ success: false, message: "Too many requests" });
    }
  } catch (error) {
    console.log("Error in ratecheck: ", error);
    res.status(500).json({ success: false, message: "Server internal error" });
  }
};

export const verifyToken = async (req, res, next) => {
  try {
    if (req.auth().userId) {
      const userId = req.auth().userId;
      let user = await User.findOne({ email: userId });
      if (!user) {
        const clerkUser = await clerkClient.users.getUser(userId);
        user = await User.create({
          email: clerkUser.id,
          name: `${clerkUser.firstName} ${clerkUser.lastName}`,
          password: "clerkUser",
          isVerified: true,
        });
      }

      req.user = user;
      next();
    } else {
      let token;
      if (req.headers["x-client-type"] == "android-app") {
        let str = req.headers["authorization"];
        if (str) {
          str = str.split(" ");
          if (str.length == 2) token = str[1];
        }
      } else {
        token = req.cookies.token;
      }

      if (!token)
        return res.status(401).json({
          success: false,
          message: "Unauthorized - no token provided",
        });

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }

      if (!decoded)
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });

      const user = await User.findById(decoded.userId).select("-password");

      if (!user)
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });

      req.user = user;

      next();
    }
  } catch (error) {
    console.log("Error in verifyToken ", error);
    res.status(500).json({ success: false, message: "Server internal error" });
  }
};
