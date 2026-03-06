import express from "express";
import { analytics } from "../controllers/analytics_controller.js";

const router = express.Router();

router.get("/", analytics);

export default router;
