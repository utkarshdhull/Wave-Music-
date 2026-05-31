import { Router } from "express";
import { getProfile, updateAvatar, updateProfile } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { avatarUpload } from "../middleware/uploadMiddleware.js";

export const userRoutes = Router();

userRoutes.use(protect);
userRoutes.get("/profile", getProfile);
userRoutes.patch("/profile", updateProfile);
userRoutes.patch("/avatar", avatarUpload, updateAvatar);

