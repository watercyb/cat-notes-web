import User from "../models/user_model.js";

export const ratecheck = async (req, res, next) => {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    if (await checkLimit(ip)) {
      next();
    } else {
      res.status(429).json("Too many requests");
    }
  } catch (error) {
    console.log("Error on ratecheck: ", error);
    res.status(500).json("Internal error");
  }
};

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - no token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - invalid token" });

    const user = await User.findById(decoded.userId).select("-password");

    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - User not found" });

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in verifyToken ", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
