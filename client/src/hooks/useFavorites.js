import { useCallback, useEffect, useMemo, useState } from "react";
import { addFavorite, getFavorites, removeFavorite } from "../api/songApi";
import { useAuth } from "./useAuth";

export function useFavorites() {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  const favoriteIds = useMemo(() => new Set(favorites.map((song) => song.id)), [favorites]);

  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      return [];
    }

    setIsLoadingFavorites(true);

    try {
      const songs = await getFavorites();
      setFavorites(songs);
      return songs;
    } finally {
      setIsLoadingFavorites(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshFavorites().catch(() => setFavorites([]));
  }, [refreshFavorites]);

  const toggleFavorite = useCallback(
    async (song) => {
      if (!isAuthenticated) {
        return;
      }

      if (favoriteIds.has(song.id)) {
        await removeFavorite(song.id);
        setFavorites((current) => current.filter((favorite) => favorite.id !== song.id));
        return;
      }

      await addFavorite(song.id);
      setFavorites((current) => [song, ...current]);
    },
    [favoriteIds, isAuthenticated]
  );

  return {
    favoriteIds,
    favorites,
    isLoadingFavorites,
    refreshFavorites,
    setFavorites,
    toggleFavorite
  };
}

