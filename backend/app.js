import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth_route.js";
import cookieParser from "cookie-parser";
import noteRoutes from "./routes/note_route.js";
import { rateCheck } from "./middleware/middleware.js";
import { clerkMiddleware } from "@clerk/express";
import path from "path";
import analytics from "./routes/analytics_route.js";

dotenv.config({ quiet: true });

const port = process.env.PORT;

const app = express();
const __dirname = path.resolve();

let maintenanceMode = false;

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

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not Found" });
});

export const setMaintenanceMode = (mode) => {
  maintenanceMode = mode;
};

export default app;
