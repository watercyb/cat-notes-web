import express from "express";
import {
  checkAuth,
  login,
  logout,
  signup,
} from "../controllers/user_controller.js";
import { verifyToken } from "../middleware/middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/check-auth", verifyToken, checkAuth);

export default router;
