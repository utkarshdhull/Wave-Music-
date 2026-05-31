import { api } from "./axios";

export async function getRecommendations() {
  const { data } = await api.get("/recommendations");
  return data.songs;
}

export async function getGenreRecommendations(genre) {
  const { data } = await api.get(`/recommendations/genre/${encodeURIComponent(genre)}`);
  return data.songs;
}

