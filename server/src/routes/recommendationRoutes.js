import { Router } from "express";
import {
  getGenreRecommendations,
  getRecommendations
} from "../controllers/recommendationController.js";
import { protect } from "../middleware/authMiddleware.js";

export const recommendationRoutes = Router();

recommendationRoutes.get("/", protect, getRecommendations);
recommendationRoutes.get("/genre/:genre", getGenreRecommendations);

