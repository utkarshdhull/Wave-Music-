import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { removeFile } from "../utils/files.js";
import { serializeUser } from "../utils/serializers.js";

export const getProfile = asyncHandler(async (req, res) => {
  res.json({ user: serializeUser(req.user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (name !== undefined) {
    req.user.name = name;
  }

  await req.user.save();

  res.json({ user: serializeUser(req.user) });
});

export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Avatar image is required");
  }

  const previousAvatarPath = req.user.avatarPath;
  req.user.avatarPath = req.file.path;

  await req.user.save();
  await removeFile(previousAvatarPath);

  res.json({ user: serializeUser(req.user) });
});

