import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      enum: ["CREATE_PLAYLIST", "LIKE_SONG", "ADD_COLLABORATOR", "UPLOAD_SONG", "FOLLOW_PLAYLIST"]
    },
    targetName: {
      type: String,
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    metadata: {
      type: Map,
      of: String
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Activity = mongoose.model("Activity", activitySchema);
