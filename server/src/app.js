import cors from "cors";
import express from "express";
import morgan from "morgan";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
import { authRoutes } from "./routes/authRoutes.js";
import { playlistRoutes } from "./routes/playlistRoutes.js";
import { recommendationRoutes } from "./routes/recommendationRoutes.js";
import { songRoutes } from "./routes/songRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";
import { socialRoutes } from "./routes/socialRoutes.js";

export const app = express();
const uploadRoot = fileURLToPath(new URL("../uploads/", import.meta.url));

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (e.g. curl, Postman, same-origin)
      if (!origin) return callback(null, true);
      // Build allowed set: the configured origin + its localhost/127.0.0.1 twin
      const configured = env.clientOrigin;
      const twin = configured.includes("localhost")
        ? configured.replace("localhost", "127.0.0.1")
        : configured.replace("127.0.0.1", "localhost");
      const allowed = new Set([configured, twin]);
      if (allowed.has(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use("/uploads", express.static(uploadRoot));

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
