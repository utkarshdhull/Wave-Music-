import mongoose from "mongoose";
import { connectDb } from "../server/src/config/db.js";
import { env } from "../server/src/config/env.js";
import { Favorite } from "../server/src/models/Favorite.js";
import { Playlist } from "../server/src/models/Playlist.js";
import { RecentlyPlayed } from "../server/src/models/RecentlyPlayed.js";
import { Song } from "../server/src/models/Song.js";
import { User } from "../server/src/models/User.js";

const suffix = Date.now();
let songId = null;
let userId = null;

await connectDb(env.mongodbUri, { serverSelectionTimeoutMS: 5000 });

try {
  const user = await User.create({
    email: `smoke-${suffix}@wave.local`,
    name: "Smoke User",
    passwordHash: "not-used"
  });
  userId = user._id;

  const song = await Song.create({
    artist: "Smoke Artist",
    audioPath: "/tmp/wave-smoke.mp3",
    mimeType: "audio/mpeg",
    title: "Smoke Track",
    uploadedBy: user._id
  });
  songId = song._id;

  await Favorite.create({ song: song._id, user: user._id });
  await RecentlyPlayed.create({ song: song._id, user: user._id });
  await Playlist.create({ name: "Smoke Playlist", owner: user._id, songs: [song._id] });

  const foundSong = await Song.findOne({ uploadedBy: user._id });

  if (!foundSong) {
    throw new Error("Mongo smoke document lookup failed");
  }

  console.log("mongo smoke ok");
} finally {
  await Promise.all([
    Favorite.deleteMany({ song: songId, user: userId }),
    RecentlyPlayed.deleteMany({ song: songId, user: userId }),
    Playlist.deleteMany({ name: "Smoke Playlist" }),
    Song.deleteMany({ title: "Smoke Track" }),
    User.deleteMany({ email: `smoke-${suffix}@wave.local` })
  ]);
  await mongoose.disconnect();
}
