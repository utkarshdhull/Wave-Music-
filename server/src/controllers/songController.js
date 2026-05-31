import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Favorite } from "../models/Favorite.js";
import { Playlist } from "../models/Playlist.js";
import { RecentlyPlayed } from "../models/RecentlyPlayed.js";
import { Song } from "../models/Song.js";
import { ApiError } from "../utils/ApiError.js";
import { canManageResource } from "../utils/access.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { removeFile } from "../utils/files.js";
import { serializeSong } from "../utils/serializers.js";

const songFields = ["title", "artist", "album", "genre", "duration"];

function pagination(query) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 50);

  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
}

function assignSongFields(song, body) {
  songFields.forEach((field) => {
    if (body[field] !== undefined) {
      song[field] = field === "duration" ? Number(body[field]) || 0 : body[field];
    }
  });
}

async function findSongOrThrow(id) {
  const song = await Song.findById(id);

  if (!song) {
    throw new ApiError(404, "Song not found");
  }

  return song;
}

async function recordRecentlyPlayed(userId, songId) {
  await RecentlyPlayed.create({ user: userId, song: songId });

  const staleEntries = await RecentlyPlayed.find({ user: userId })
    .sort({ playedAt: -1 })
    .skip(50)
    .select("_id");

  if (staleEntries.length) {
    await RecentlyPlayed.deleteMany({ _id: { $in: staleEntries.map((entry) => entry._id) } });
  }
}

export const listSongs = asyncHandler(async (req, res) => {
  const { limit, skip, page } = pagination(req.query);
  const [songs, total] = await Promise.all([
    Song.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Song.countDocuments()
  ]);

  res.json({
    songs: songs.map(serializeSong),
    page,
    total,
    totalPages: Math.ceil(total / limit)
  });
});

export const searchSongs = asyncHandler(async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  const { limit, skip, page } = pagination(req.query);

  if (!q) {
    res.json({ songs: [], page, total: 0, totalPages: 0 });
    return;
  }

  const filter = { $text: { $search: q } };
  const [songs, total] = await Promise.all([
    Song.find(filter, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit),
    Song.countDocuments(filter)
  ]);

  res.json({
    songs: songs.map(serializeSong),
    page,
    total,
    totalPages: Math.ceil(total / limit)
  });
});

export const getSong = asyncHandler(async (req, res) => {
  const song = await findSongOrThrow(req.params.id);

  res.json({ song: serializeSong(song) });
});

export const createSong = asyncHandler(async (req, res) => {
  const audioFile = req.files?.audio?.[0];
  const coverFile = req.files?.cover?.[0] ?? null;

  if (!audioFile) {
    throw new ApiError(400, "Audio file is required");
  }

  if (!req.body.title || !req.body.artist) {
    await Promise.all([removeFile(audioFile.path), removeFile(coverFile?.path)]);
    throw new ApiError(400, "Title and artist are required");
  }

  const song = new Song({
    uploadedBy: req.user._id,
    audioPath: audioFile.path,
    coverPath: coverFile?.path ?? null,
    mimeType: audioFile.mimetype
  });

  assignSongFields(song, req.body);
  await song.save();

  res.status(201).json({ song: serializeSong(song) });
});

export const updateSong = asyncHandler(async (req, res) => {
  const song = await findSongOrThrow(req.params.id);

  if (!canManageResource(req.user, song.uploadedBy)) {
    throw new ApiError(403, "You cannot update this song");
  }

  const previousAudioPath = song.audioPath;
  const previousCoverPath = song.coverPath;
  const audioFile = req.files?.audio?.[0];
  const coverFile = req.files?.cover?.[0];

  assignSongFields(song, req.body);

  if (audioFile) {
    song.audioPath = audioFile.path;
    song.mimeType = audioFile.mimetype;
  }

  if (coverFile) {
    song.coverPath = coverFile.path;
  }

  await song.save();

  if (audioFile) {
    await removeFile(previousAudioPath);
  }

  if (coverFile) {
    await removeFile(previousCoverPath);
  }

  res.json({ song: serializeSong(song) });
});

export const deleteSong = asyncHandler(async (req, res) => {
  const song = await findSongOrThrow(req.params.id);

  if (!canManageResource(req.user, song.uploadedBy)) {
    throw new ApiError(403, "You cannot delete this song");
  }

  await Promise.all([
    Favorite.deleteMany({ song: song._id }),
    RecentlyPlayed.deleteMany({ song: song._id }),
    Playlist.updateMany({ songs: song._id }, { $pull: { songs: song._id } })
  ]);

  await song.deleteOne();
  await Promise.all([removeFile(song.audioPath), removeFile(song.coverPath)]);

  res.status(204).end();
});

export const streamSong = asyncHandler(async (req, res) => {
  const song = await findSongOrThrow(req.params.id);
  const fileStat = await stat(song.audioPath).catch(() => null);

  if (!fileStat) {
    throw new ApiError(404, "Audio file not found");
  }

  const range = req.headers.range;

  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Content-Type", song.mimeType);

  if (!range) {
    res.setHeader("Content-Length", fileStat.size);
    createReadStream(song.audioPath).pipe(res);
    return;
  }

  const [startValue, endValue] = range.replace("bytes=", "").split("-");
  const suffixLength = startValue ? null : Number(endValue);
  const start = suffixLength ? Math.max(fileStat.size - suffixLength, 0) : Number(startValue);
  const end = suffixLength ? fileStat.size - 1 : endValue ? Number(endValue) : fileStat.size - 1;

  if (Number.isNaN(start) || Number.isNaN(end) || start > end || end >= fileStat.size) {
    res.setHeader("Content-Range", `bytes */${fileStat.size}`);
    res.status(416).end();
    return;
  }

  res.status(206);
  res.setHeader("Content-Range", `bytes ${start}-${end}/${fileStat.size}`);
  res.setHeader("Content-Length", end - start + 1);
  createReadStream(song.audioPath, { start, end }).pipe(res);
});

export const recordPlay = asyncHandler(async (req, res) => {
  const song = await findSongOrThrow(req.params.id);

  song.playCount += 1;
  await Promise.all([song.save(), recordRecentlyPlayed(req.user._id, song._id)]);

  res.status(201).json({ song: serializeSong(song) });
});

export const addRecentlyPlayed = asyncHandler(async (req, res) => {
  const song = await findSongOrThrow(req.params.id);

  await recordRecentlyPlayed(req.user._id, song._id);

  res.status(201).json({ song: serializeSong(song) });
});

export const getRecentlyPlayed = asyncHandler(async (req, res) => {
  const entries = await RecentlyPlayed.find({ user: req.user._id })
    .sort({ playedAt: -1 })
    .limit(50)
    .populate("song");

  res.json({
    songs: entries.filter((entry) => entry.song).map((entry) => serializeSong(entry.song))
  });
});

export const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id }).sort({ createdAt: -1 }).populate("song");

  res.json({
    songs: favorites.filter((favorite) => favorite.song).map((favorite) => serializeSong(favorite.song))
  });
});

export const addFavorite = asyncHandler(async (req, res) => {
  const song = await findSongOrThrow(req.params.id);

  await Favorite.updateOne(
    { user: req.user._id, song: song._id },
    { $setOnInsert: { user: req.user._id, song: song._id } },
    { upsert: true }
  );

  res.status(201).json({ song: serializeSong(song) });
});

export const removeFavorite = asyncHandler(async (req, res) => {
  await Favorite.deleteOne({ user: req.user._id, song: req.params.id });

  res.status(204).end();
});
