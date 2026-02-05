import jwt from "jsonwebtoken";

export const generateToken = async (req, res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  if (req.headers["x-client-type"] == "android-app") {
    res.setHeader("Authorization", `Bearer ${token}`);
  } else {
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
};
