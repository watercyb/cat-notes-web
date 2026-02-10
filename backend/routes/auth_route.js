import express from "express";
import {
    changePassword,
  checkAuth,
  forgotPassword,
  login,
  logout,
  resendEmailVerification,
  resetPassword,
  signup,
  verifyEmail,
} from "../controllers/user_controller.js";
import { rateCheckEmail, verifyToken } from "../middleware/middleware.js";

const router = express.Router();

router.post("/signup", rateCheckEmail, signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/check-auth", verifyToken, checkAuth);

router.post("/verify-email", verifyToken, verifyEmail);
router.post(
  "/resend-email",
  rateCheckEmail,
  verifyToken,
  resendEmailVerification,
);
router.post("/forgot-password", rateCheckEmail, forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.post("/password", verifyToken, changePassword);

export default router;
