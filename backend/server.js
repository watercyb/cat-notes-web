import express from "express";
import { connectDB } from "./db/mongodb.js";
import dotenv from "dotenv";
import authRoutes from "./routes/auth_route.js";
import cookieParser from "cookie-parser";
import noteRoutes from "./routes/note_route.js";
import { rateCheck } from "./middleware/middleware.js";
import { clerkMiddleware } from "@clerk/express";
import path from "path";

dotenv.config();

const port = process.env.PORT;

const app = express();
const __dirname = path.resolve();

app.use(clerkMiddleware());

app.use(express.json());
app.use(cookieParser());
app.use(rateCheck);

app.use("/api/auth", authRoutes);
app.use("/api/note", noteRoutes);

if (process.env.NODE_ENV !== "development") {
  app.use(express.static(path.join(__dirname, "./frontend/dist")));
  app.get(new RegExp(".*"), (req, res) => {
    res.sendFile(path.resolve(__dirname, "./frontend", "dist", "index.html"));
  });
}

app.listen(port, () => {
  console.log("Running on port: ", port);
  connectDB();
});
