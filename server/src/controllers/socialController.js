import { Activity } from "../models/Activity.js";
import { RecentlyPlayed } from "../models/RecentlyPlayed.js";
import { User } from "../models/User.js";
import { Favorite } from "../models/Favorite.js";
import { Playlist } from "../models/Playlist.js";
import { Song } from "../models/Song.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { serializeSong } from "../utils/serializers.js";

// Log a social activity helper
export async function logActivity(userId, type, targetName, targetId, metadata = {}) {
  try {
    await Activity.create({
      user: userId,
      type,
      targetName,
      targetId,
      metadata
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

// Get user profile statistics ( listening time, top genres, top artists, top songs)
export const getProfileStats = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user._id;

  const profileUser = await User.findById(userId);
  if (!profileUser) {
    throw new ApiError(404, "User not found");
  }

  // 1. Total listening time (sum of durations of played songs)
  const totalListening = await RecentlyPlayed.aggregate([
    { $match: { user: profileUser._id } },
    {
      $lookup: {
        from: "songs",
        localField: "song",
        foreignField: "_id",
        as: "songInfo"
      }
    },
    { $unwind: { path: "$songInfo", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: null,
        totalTime: { $sum: { $ifNull: ["$songInfo.duration", 180] } }
      }
    }
  ]);
  const totalTime = totalListening[0]?.totalTime || 0;

  // 2. Top Genres (aggregated from play history)
  const topGenres = await RecentlyPlayed.aggregate([
    { $match: { user: profileUser._id } },
    {
      $lookup: {
        from: "songs",
        localField: "song",
        foreignField: "_id",
        as: "songInfo"
      }
    },
    { $unwind: "$songInfo" },
    { $group: { _id: "$songInfo.genre", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  // 3. Top Artists (aggregated from play history)
  const topArtists = await RecentlyPlayed.aggregate([
    { $match: { user: profileUser._id } },
    {
      $lookup: {
        from: "songs",
        localField: "song",
        foreignField: "_id",
        as: "songInfo"
      }
    },
    { $unwind: "$songInfo" },
    { $group: { _id: "$songInfo.artist", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  // 4. Most Played Songs (aggregated from play history)
  const topSongsAgg = await RecentlyPlayed.aggregate([
    { $match: { user: profileUser._id } },
    { $group: { _id: "$song", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "songs",
        localField: "_id",
        foreignField: "_id",
        as: "songInfo"
      }
    },
    { $unwind: "$songInfo" }
  ]);

  const mostPlayed = topSongsAgg.map((item) => ({
    song: serializeSong(item.songInfo),
    playCount: item.count
  }));

  // 5. Playlists count
  const playlistCount = await Playlist.countDocuments({ owner: profileUser._id });

  res.json({
    user: {
      id: profileUser._id,
      name: profileUser.name,
      email: profileUser.email,
      avatarPath: profileUser.avatarPath,
      role: profileUser.role
    },
    stats: {
      totalTime, // in seconds
      playlistCount,
      topGenres: topGenres.map((g) => ({ name: g._id || "Other", count: g.count })),
      topArtists: topArtists.map((a) => ({ name: a._id || "Various Artists", count: a.count })),
      mostPlayed
    }
  });
});

// Get global activity feed
export const getActivityFeed = asyncHandler(async (req, res) => {
  const activities = await Activity.find()
    .populate("user", "name avatarPath")
    .sort({ createdAt: -1 })
    .limit(30);

  res.json({ activities });
});

// Get friends currently listening list
export const getFriendActivity = asyncHandler(async (req, res) => {
  const otherPlays = await RecentlyPlayed.find({ user: { $ne: req.user._id } })
    .populate("user", "name avatarPath")
    .populate("song")
    .sort({ playedAt: -1 })
    .limit(10);

  if (otherPlays.length === 0) {
    // Generate simulated active list so the interface looks premium and social
    const mockUsers = [
      { name: "Aarav Sharma", song: { title: "Kuchh Log Mohabbat Karke", artist: "Kishore Kumar" } },
      { name: "Priya Patel", song: { title: "Oscar", artist: "Gippy Grewal" } },
      { name: "Rohan Verma", song: { title: "Bahu Nahi Yo Chala Sai", artist: "Raju Punjabi" } },
      { name: "Sneha Reddy", song: { title: "High Rated Gabru", artist: "Guru Randhawa" } }
    ];
    const mockActivity = mockUsers.map((m, idx) => ({
      _id: `mock-${idx}`,
      user: { id: `mock-user-${idx}`, name: m.name, avatarPath: null },
      song: { id: `mock-song-${idx}`, title: m.song.title, artist: m.song.artist },
      playedAt: new Date(Date.now() - idx * 240000)
    }));
    return res.json({ activity: mockActivity });
  }

  res.json({
    activity: otherPlays.map((p) => ({
      _id: p._id,
      user: { id: p.user._id, name: p.user.name, avatarPath: p.user.avatarPath },
      song: p.song ? { id: p.song._id, title: p.song.title, artist: p.song.artist } : null,
      playedAt: p.playedAt
    }))
  });
});
