import express from "express";
import {
  changePassword,
  changeUsername,
  checkAuth,
  forgotPassword,
  login,
  logout,
  resendEmailVerification,
  resetPassword,
  signup,
  verifyEmail,
} from "../controllers/user_controller.js";
import {
  rateCheckResetPassword,
  rateCheckSignup,
  verifyToken,
} from "../middleware/middleware.js";

const router = express.Router();

router.post("/signup", rateCheckSignup, signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/check-auth", verifyToken, checkAuth);

router.post("/verify-email", verifyToken, verifyEmail);
router.post(
  "/resend-email",
  rateCheckSignup,
  verifyToken,
  resendEmailVerification,
);
router.post("/forgot-password", rateCheckResetPassword, forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.post("/password", verifyToken, rateCheckSignup, changePassword);

router.post("/username", verifyToken, changeUsername);

export default router;
