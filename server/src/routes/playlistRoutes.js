import { Router } from "express";
import {
  addPlaylistSong,
  createPlaylist,
  deletePlaylist,
  getPlaylist,
  listPlaylists,
  removePlaylistSong,
  updatePlaylist,
  addCollaborator,
  removeCollaborator
} from "../controllers/playlistController.js";
import { protect, optionalProtect } from "../middleware/authMiddleware.js";

export const playlistRoutes = Router();

// Public/Optional routes
playlistRoutes.get("/", optionalProtect, listPlaylists);
playlistRoutes.get("/:id", optionalProtect, getPlaylist);

// Protected routes
playlistRoutes.post("/", protect, createPlaylist);
playlistRoutes.patch("/:id", protect, updatePlaylist);
playlistRoutes.delete("/:id", protect, deletePlaylist);
playlistRoutes.post("/:id/songs/:songId", protect, addPlaylistSong);
playlistRoutes.delete("/:id/songs/:songId", protect, removePlaylistSong);
playlistRoutes.post("/:id/collaborators", protect, addCollaborator);
playlistRoutes.delete("/:id/collaborators/:userId", protect, removeCollaborator);
