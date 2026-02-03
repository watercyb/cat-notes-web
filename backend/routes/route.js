import { Router } from "express";
import { checkLimit } from "../db/redis.js";

const router = Router();

router.get("/", async (req, res) => {

  console.log(ip);
  res.json();
});

export default router;
