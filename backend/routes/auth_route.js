import express from "express";
import {
  checkAuth,
  forgotPassword,
  login,
  logout,
  resendEmailVerification,
  resetPassword,
  signup,
  verifyEmail,
} from "../controllers/user_controller.js";
import { verifyToken } from "../middleware/middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/check-auth", verifyToken, checkAuth);

router.post("/verify-email", verifyToken, verifyEmail);
router.post("/resend-email", verifyToken, resendEmailVerification);
router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

export default router;
