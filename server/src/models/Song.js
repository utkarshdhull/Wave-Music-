import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    artist: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    album: {
      type: String,
      trim: true,
      maxlength: 160,
      default: ""
    },
    genre: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ""
    },
    duration: {
      type: Number,
      min: 0,
      default: 0
    },
    audioPath: {
      type: String,
      required: true
    },
    coverPath: {
      type: String,
      default: null
    },
    mimeType: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    playCount: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  { timestamps: true }
);

songSchema.index({ title: "text", artist: "text", album: "text", genre: "text" });
songSchema.index({ genre: 1, playCount: -1 });

export const Song = mongoose.model("Song", songSchema);

