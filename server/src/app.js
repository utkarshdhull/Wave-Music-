import cors from "cors";
import express from "express";
import { existsSync } from "fs";
import morgan from "morgan";
import { fileURLToPath } from "url";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
import { authRoutes } from "./routes/authRoutes.js";
import { playlistRoutes } from "./routes/playlistRoutes.js";
import { recommendationRoutes } from "./routes/recommendationRoutes.js";
import { songRoutes } from "./routes/songRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";
import { socialRoutes } from "./routes/socialRoutes.js";

export const app = express();

// Singleton DB connection promise
let _dbConnection = null;
export async function ensureDb() {
  if (!_dbConnection) {
    _dbConnection = connectDb(env.mongodbUri);
  }
  await _dbConnection;
}

const uploadRoot = fileURLToPath(new URL("../uploads/", import.meta.url));

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (e.g. curl, Postman, same-origin)
      if (!origin) return callback(null, true);
      // Support comma-separated list of allowed origins
      const configured = env.clientOrigin;
      const allowed = new Set(
        configured.split(",").flatMap((o) => {
          const trimmed = o.trim();
          const twin = trimmed.includes("localhost")
            ? trimmed.replace("localhost", "127.0.0.1")
            : trimmed.replace("127.0.0.1", "localhost");
          return [trimmed, twin];
        })
      );
      if (allowed.has(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

// Guarantee DB is connected before every request (Vercel serverless safe)
app.use(async (req, res, next) => {
  try {
    await ensureDb();
    next();
  } catch (err) {
    next(err);
  }
});

// Serve uploads only when the directory actually exists (skipped on Vercel)
if (existsSync(uploadRoot)) {
  app.use("/uploads", express.static(uploadRoot));
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/social", socialRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
