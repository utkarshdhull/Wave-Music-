import dotenv from "dotenv";

dotenv.config();

export const env = {
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET ?? "",
  mongodbUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/wave",
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000)
};

