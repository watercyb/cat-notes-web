import jwt from "jsonwebtoken";
import { redis } from "../db/redis.js";

export const generateToken = async (req, res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  if (req.headers["x-client-type"] == "android-app") {
    res.setHeader("Authorization", `Bearer ${token}`);
  } else {
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
  }
};

export const generateRefreshToken = (req, res, userId) => {
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  if (req.headers["x-client-type"] == "android-app") {
    res.setHeader("refreshToken", `Bearer ${refreshToken}`);
  } else {
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
  }

  redis.set(`refresh_token:${userId}`, refreshToken, { ex: 7 * 24 * 60 * 60 });

  return refreshToken;
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV !== "development",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/api/auth/refresh",
};
