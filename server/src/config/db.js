import mongoose from "mongoose";

export async function connectDb(uri, options = {}) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, options);
}
