import { Favorite } from "../models/Favorite.js";
import { RecentlyPlayed } from "../models/RecentlyPlayed.js";
import { Song } from "../models/Song.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { serializeSong } from "../utils/serializers.js";

export const getRecommendations = asyncHandler(async (req, res) => {
  const [recentEntries, favoriteEntries] = await Promise.all([
    RecentlyPlayed.find({ user: req.user._id }).sort({ playedAt: -1 }).limit(25).populate("song"),
    Favorite.find({ user: req.user._id }).limit(25).populate("song")
  ]);

  const seedSongs = [...recentEntries, ...favoriteEntries]
    .map((entry) => entry.song)
    .filter((song) => song?.genre);

  const genres = [...new Set(seedSongs.map((song) => song.genre))];
  const excludedIds = seedSongs.map((song) => song._id);

  const filter = genres.length ? { genre: { $in: genres }, _id: { $nin: excludedIds } } : {};
  const songs = await Song.find(filter).sort({ playCount: -1, createdAt: -1 }).limit(20);

  res.json({ songs: songs.map(serializeSong) });
});

export const getGenreRecommendations = asyncHandler(async (req, res) => {
  const songs = await Song.find({ genre: req.params.genre }).sort({ playCount: -1, createdAt: -1 }).limit(20);

  res.json({ songs: songs.map(serializeSong) });
});

