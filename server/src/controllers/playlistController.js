import { Playlist } from "../models/Playlist.js";
import { Song } from "../models/Song.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { canManageResource } from "../utils/access.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { serializePlaylist } from "../utils/serializers.js";
import { logActivity } from "./socialController.js";

async function findPlaylistOrThrow(id) {
  const playlist = await Playlist.findById(id).populate("songs").populate("collaborators");

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return playlist;
}

function assertPlaylistAccess(user, playlist) {
  if (playlist.isPublic) return;
  if (!user) {
    throw new ApiError(401, "Authentication required");
  }
  const isCollaborator = playlist.collaborators?.some((c) => String(c._id || c) === String(user._id));
  if (!isCollaborator && !canManageResource(user, playlist.owner)) {
    throw new ApiError(403, "You cannot access this playlist");
  }
}

function assertPlaylistManagement(user, playlist) {
  if (!user) {
    throw new ApiError(401, "Authentication required");
  }
  const isCollaborator = playlist.collaborators?.some((c) => String(c._id || c) === String(user._id));
  if (!isCollaborator && !canManageResource(user, playlist.owner)) {
    throw new ApiError(403, "You cannot modify this playlist");
  }
}

function assertPlaylistOwner(user, playlist) {
  if (!user) {
    throw new ApiError(401, "Authentication required");
  }
  if (!canManageResource(user, playlist.owner)) {
    throw new ApiError(403, "Only the playlist owner can perform this action");
  }
}

function parseBoolean(value) {
  return value === true || value === "true";
}

export const listPlaylists = asyncHandler(async (req, res) => {
  const filter =
    req.query.scope === "public"
      ? { isPublic: true }
      : { $or: [{ owner: req.user._id }, { isPublic: true }] };

  const playlists = await Playlist.find(filter).sort({ updatedAt: -1 });

  res.json({ playlists: playlists.map(serializePlaylist) });
});

export const getPlaylist = asyncHandler(async (req, res) => {
  const playlist = await findPlaylistOrThrow(req.params.id);

  assertPlaylistAccess(req.user, playlist);

  res.json({ playlist: serializePlaylist(playlist) });
});

export const createPlaylist = asyncHandler(async (req, res) => {
  if (!req.body.name) {
    throw new ApiError(400, "Playlist name is required");
  }

  const playlist = await Playlist.create({
    name: req.body.name,
    description: req.body.description ?? "",
    owner: req.user._id,
    isPublic: parseBoolean(req.body.isPublic)
  });

  // Log social activity
  await logActivity(req.user._id, "CREATE_PLAYLIST", playlist.name, playlist._id);

  res.status(201).json({ playlist: serializePlaylist(playlist) });
});

export const updatePlaylist = asyncHandler(async (req, res) => {
  const playlist = await findPlaylistOrThrow(req.params.id);

  assertPlaylistOwner(req.user, playlist);

  ["name", "description"].forEach((field) => {
    if (req.body[field] !== undefined) {
      playlist[field] = req.body[field];
    }
  });

  if (req.body.isPublic !== undefined) {
    playlist.isPublic = parseBoolean(req.body.isPublic);
  }

  await playlist.save();

  res.json({ playlist: serializePlaylist(playlist) });
});

export const deletePlaylist = asyncHandler(async (req, res) => {
  const playlist = await findPlaylistOrThrow(req.params.id);

  assertPlaylistOwner(req.user, playlist);

  await playlist.deleteOne();

  res.status(204).end();
});

export const addPlaylistSong = asyncHandler(async (req, res) => {
  const [playlist, song] = await Promise.all([
    findPlaylistOrThrow(req.params.id),
    Song.findById(req.params.songId)
  ]);

  assertPlaylistManagement(req.user, playlist);

  if (!song) {
    throw new ApiError(404, "Song not found");
  }

  playlist.songs.addToSet(song._id);
  await playlist.save();
  await playlist.populate("songs");
  await playlist.populate("collaborators");

  res.status(201).json({ playlist: serializePlaylist(playlist) });
});

export const removePlaylistSong = asyncHandler(async (req, res) => {
  const playlist = await findPlaylistOrThrow(req.params.id);

  assertPlaylistManagement(req.user, playlist);

  playlist.songs.pull(req.params.songId);
  await playlist.save();
  await playlist.populate("songs");
  await playlist.populate("collaborators");

  res.json({ playlist: serializePlaylist(playlist) });
});

export const addCollaborator = asyncHandler(async (req, res) => {
  const playlist = await findPlaylistOrThrow(req.params.id);
  assertPlaylistOwner(req.user, playlist);

  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Collaborator email is required");
  }

  const userToInvite = await User.findOne({ email });
  if (!userToInvite) {
    throw new ApiError(404, "User not found with this email");
  }

  if (String(userToInvite._id) === String(playlist.owner)) {
    throw new ApiError(400, "Owner is already the collaborator");
  }

  playlist.collaborators.addToSet(userToInvite._id);
  await playlist.save();
  await playlist.populate("songs");
  await playlist.populate("collaborators");

  // Log activity
  await logActivity(req.user._id, "ADD_COLLABORATOR", playlist.name, playlist._id, {
    collaboratorName: userToInvite.name,
    collaboratorEmail: userToInvite.email
  });

  res.status(201).json({ playlist: serializePlaylist(playlist) });
});

export const removeCollaborator = asyncHandler(async (req, res) => {
  const playlist = await findPlaylistOrThrow(req.params.id);
  assertPlaylistOwner(req.user, playlist);

  const { userId } = req.params;
  playlist.collaborators.pull(userId);
  await playlist.save();
  await playlist.populate("songs");
  await playlist.populate("collaborators");

  res.json({ playlist: serializePlaylist(playlist) });
});
