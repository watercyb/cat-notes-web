import dotenv from "dotenv";
import mongoose from "mongoose";
import Note from "../models/note.model.js";

dotenv.config();

export const connectDB = async (params) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongodb connected.");
  } catch (error) {
    console.log("Error connecting mongodb.");
    process.exit(1);
  }
};
