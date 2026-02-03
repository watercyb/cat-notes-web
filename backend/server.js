import express from "express";
import router from "./routes/route.js";
import { connectDB } from "./db/mongodb.js";
import dotenv from "dotenv";
import authRoutes from "./routes/auth_route.js";
import cookieParser from "cookie-parser";

dotenv.config();

const port = process.env.PORT;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/", router);
app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log("Running on port: ", port);
  connectDB();
});
