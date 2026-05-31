import crypto from "crypto";
import { mkdirSync } from "fs";
import { fileURLToPath } from "url";
import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const uploadDirs = {
  audio: fileURLToPath(new URL("../../uploads/songs/", import.meta.url)),
  cover: fileURLToPath(new URL("../../uploads/covers/", import.meta.url)),
  avatar: fileURLToPath(new URL("../../uploads/avatars/", import.meta.url))
};

Object.values(uploadDirs).forEach((dir) => mkdirSync(dir, { recursive: true }));

const storage = multer.diskStorage({
  destination(req, file, callback) {
    if (file.fieldname === "audio") {
      callback(null, uploadDirs.audio);
      return;
    }

    if (file.fieldname === "cover") {
      callback(null, uploadDirs.cover);
      return;
    }

    callback(null, uploadDirs.avatar);
  },
  filename(_req, file, callback) {
    const extension = file.originalname.includes(".")
      ? file.originalname.slice(file.originalname.lastIndexOf(".")).toLowerCase()
      : "";

    callback(null, `${crypto.randomUUID()}${extension}`);
  }
});

function fileFilter(_req, file, callback) {
  const isAudio = file.fieldname === "audio" && file.mimetype.startsWith("audio/");
  const isImage = ["cover", "avatar"].includes(file.fieldname) && file.mimetype.startsWith("image/");

  if (!isAudio && !isImage) {
    callback(new ApiError(400, "Unsupported upload type"));
    return;
  }

  callback(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024
  }
});

export const songUpload = upload.fields([
  { name: "audio", maxCount: 1 },
  { name: "cover", maxCount: 1 }
]);

export const avatarUpload = upload.single("avatar");

