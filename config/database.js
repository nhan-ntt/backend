import { MONGO_URI } from "./environments.js";
import mongoose, { mongo } from "mongoose";

console.log(MONGO_URI);

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // code 1 means failure
  }
};
