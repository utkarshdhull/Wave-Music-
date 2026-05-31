import { Router } from "express";
import {
  addFavorite,
  addRecentlyPlayed,
  createSong,
  deleteSong,
  getFavorites,
  getRecentlyPlayed,
  getSong,
  listSongs,
  recordPlay,
  removeFavorite,
  searchSongs,
  streamSong,
  updateSong
} from "../controllers/songController.js";
import { protect } from "../middleware/authMiddleware.js";
import { songUpload } from "../middleware/uploadMiddleware.js";

export const songRoutes = Router();

songRoutes.get("/", listSongs);
songRoutes.get("/search", searchSongs);
songRoutes.get("/favorites", protect, getFavorites);
songRoutes.get("/recently-played", protect, getRecentlyPlayed);
songRoutes.post("/", protect, songUpload, createSong);
songRoutes.get("/:id", getSong);
songRoutes.patch("/:id", protect, songUpload, updateSong);
songRoutes.delete("/:id", protect, deleteSong);
songRoutes.get("/:id/stream", streamSong);
songRoutes.post("/:id/play", protect, recordPlay);
songRoutes.post("/:id/recently-played", protect, addRecentlyPlayed);
songRoutes.post("/:id/favorite", protect, addFavorite);
songRoutes.delete("/:id/favorite", protect, removeFavorite);

