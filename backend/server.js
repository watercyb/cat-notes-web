import express from "express";
import { connectDB } from "./db/mongodb.js";
import dotenv from "dotenv";
import authRoutes from "./routes/auth_route.js";
import cookieParser from "cookie-parser";
import noteRoutes from "./routes/note_route.js";
import { rateCheck } from "./middleware/middleware.js";
import { clerkMiddleware } from "@clerk/express";

dotenv.config();

const port = process.env.PORT;

const app = express();

app.use(clerkMiddleware());

app.use(express.json());
app.use(cookieParser());
app.use(rateCheck);

app.use("/api/auth", authRoutes);
app.use("/api/note", noteRoutes);

app.listen(port, () => {
  console.log("Running on port: ", port);
  connectDB();
});
