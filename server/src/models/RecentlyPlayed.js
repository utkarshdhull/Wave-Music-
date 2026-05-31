import mongoose from "mongoose";

const recentlyPlayedSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  song: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Song",
    required: true
  },
  playedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

recentlyPlayedSchema.index({ user: 1, playedAt: -1 });

export const RecentlyPlayed = mongoose.model("RecentlyPlayed", recentlyPlayedSchema);

