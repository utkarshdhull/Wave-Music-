import path from "path";

function uploadUrl(folder, filePath) {
  return filePath ? `/uploads/${folder}/${path.basename(filePath)}` : null;
}

export function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatarUrl: uploadUrl("avatars", user.avatarPath),
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export function serializeSong(song) {
  return {
    id: song._id,
    title: song.title,
    artist: song.artist,
    album: song.album,
    genre: song.genre,
    duration: song.duration,
    audioUrl: `/api/songs/${song._id}/stream`,
    coverUrl: uploadUrl("covers", song.coverPath),
    uploadedBy: song.uploadedBy,
    playCount: song.playCount,
    createdAt: song.createdAt,
    updatedAt: song.updatedAt
  };
}

export function serializePlaylist(playlist) {
  return {
    id: playlist._id,
    name: playlist.name,
    description: playlist.description,
    owner: playlist.owner,
    songs: playlist.songs?.map((song) => (song.title ? serializeSong(song) : song)) ?? [],
    isPublic: playlist.isPublic,
    coverUrl: uploadUrl("covers", playlist.coverPath),
    collaborators: playlist.collaborators?.map((c) =>
      c.name ? { id: c._id, name: c.name, email: c.email, avatarPath: c.avatarPath } : c
    ) ?? [],
    createdAt: playlist.createdAt,
    updatedAt: playlist.updatedAt
  };
}
