import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getProfileStats,
  getActivityFeed,
  getFriendActivity
} from "../controllers/socialController.js";

export const socialRoutes = Router();

socialRoutes.use(protect);

socialRoutes.get("/profile/stats", getProfileStats);
socialRoutes.get("/profile/:userId/stats", getProfileStats);
socialRoutes.get("/feed", getActivityFeed);
socialRoutes.get("/friend-activity", getFriendActivity);
