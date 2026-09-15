import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it to your .env file.");
  }
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || "budget-beaver" });
  console.log("Connected to MongoDB Atlas");
}
