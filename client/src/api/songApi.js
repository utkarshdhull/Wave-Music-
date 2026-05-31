import { api } from "./axios";

export async function listSongs(params = {}) {
  const { data } = await api.get("/songs", { params });
  return data;
}

export async function searchSongs(params = {}) {
  const { data } = await api.get("/songs/search", { params });
  return data;
}

export async function uploadSong(formData) {
  const { data } = await api.post("/songs", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return data.song;
}

export async function recordSongPlay(songId) {
  const { data } = await api.post(`/songs/${songId}/play`);
  return data.song;
}

export async function getFavorites() {
  const { data } = await api.get("/songs/favorites");
  return data.songs;
}

export async function addFavorite(songId) {
  const { data } = await api.post(`/songs/${songId}/favorite`);
  return data.song;
}

export async function removeFavorite(songId) {
  await api.delete(`/songs/${songId}/favorite`);
}

export async function getRecentlyPlayed() {
  const { data } = await api.get("/songs/recently-played");
  return data.songs;
}
