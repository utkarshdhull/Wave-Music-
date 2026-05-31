import { api } from "./axios";

export async function listPlaylists(params = {}) {
  const { data } = await api.get("/playlists", { params });
  return data.playlists;
}

export async function getPlaylist(id) {
  const { data } = await api.get(`/playlists/${id}`);
  return data.playlist;
}

export async function createPlaylist(payload) {
  const { data } = await api.post("/playlists", payload);
  return data.playlist;
}

export async function updatePlaylist(id, payload) {
  const { data } = await api.patch(`/playlists/${id}`, payload);
  return data.playlist;
}

export async function deletePlaylist(id) {
  await api.delete(`/playlists/${id}`);
}

export async function addPlaylistSong(playlistId, songId) {
  const { data } = await api.post(`/playlists/${playlistId}/songs/${songId}`);
  return data.playlist;
}

export async function removePlaylistSong(playlistId, songId) {
  const { data } = await api.delete(`/playlists/${playlistId}/songs/${songId}`);
  return data.playlist;
}

