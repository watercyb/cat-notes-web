import express from "express";
import { connectDB } from "./db/mongodb.js";
import dotenv from "dotenv";
import authRoutes from "./routes/auth_route.js";
import cookieParser from "cookie-parser";
import noteRoutes from "./routes/note_route.js";
import { rateCheck } from "./middleware/middleware.js";
import { clerkMiddleware } from "@clerk/express";
import path from "path";
import analytics from "./routes/analytics_route.js";
import cron from "node-cron";
import { cleanup } from "./utils/cleanup.js";

dotenv.config();

const port = process.env.PORT;

const app = express();
const __dirname = path.resolve();

let maintenanceMode = true;

// Middleware to block requests during maintenance
app.use((req, res, next) => {
  if (maintenanceMode) {
    return res
      .status(503)
      .json({ message: "Server under maintenance, try later." });
  }
  next();
});

app.use(clerkMiddleware());

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", rateCheck, authRoutes);
app.use("/api/note", rateCheck, noteRoutes);
app.use("/api/analytics", rateCheck, analytics);

if (process.env.NODE_ENV !== "development") {
  app.use(express.static(path.join(__dirname, "./frontend/dist")));
  app.get(new RegExp(".*"), (req, res) => {
    res.sendFile(path.resolve(__dirname, "./frontend", "dist", "index.html"));
  });
}

cron.schedule("0 3 * * *", async () => {
  // 3 AM every day
  console.log("Maintenance starting...");
  maintenanceMode = true;

  await sleep(1000);

  try {
    await cleanup();
  } catch (err) {
    console.error("Cleanup error:", err);
  } finally {
    maintenanceMode = false;
    console.log("Maintenance ended.");
  }
});

app.listen(port, () => {
  console.log("Running on port: ", port);
  connectDB();
});
