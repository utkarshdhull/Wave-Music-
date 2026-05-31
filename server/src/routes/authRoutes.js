import { Router } from "express";
import { getMe, login, logout, register } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

export const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.get("/me", protect, getMe);

