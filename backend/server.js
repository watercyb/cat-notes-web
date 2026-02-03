import express from "express";
import router from "./routes/route.js";
import { connectDB } from "./db/mongodb.js";
import  dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT;

const app = express();

app.use(express.json());

app.use("/", router);

app.listen(port, () => {
  console.log("Running on port: ", port);
  connectDB();
});
