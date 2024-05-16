import mongoose from "mongoose";
import { MONGODB_URI } from "../config.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${MONGODB_URI}`);
    console.log(`MongoDB connected!`);
  } catch (err) {
    console.error("MONGODB connection failed:", err.message);
    throw err;
  }
};

export default connectDB;
