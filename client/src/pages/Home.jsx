import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { listSongs, getRecentlyPlayed } from "../api/songApi";
import { getRecommendations } from "../api/recommendationApi";
import { SongCard } from "../components/song/SongCard";
import { StatusMessage } from "../components/ui/StatusMessage";
import { Carousel } from "../components/ui/Carousel";
import { useAuth } from "../hooks/useAuth";
import { useFavorites } from "../hooks/useFavorites";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

const DEFAULT_GENRES = [
  "All",
  "Bollywood",
  "Punjabi",
  "Haryanvi",
  "Indian Classical",
  "Hip-Hop",
  "Rock",
  "Pop",
  "Jazz",
  "R&B",
];

export function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { dynamicColor } = useAudioPlayer();
  const [songs, setSongs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState("Welcome back");

  const r = dynamicColor?.r ?? 29;
  const g = dynamicColor?.g ?? 185;
  const b = dynamicColor?.b ?? 84;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else if (hour < 22) setGreeting("Good evening");
    else setGreeting("Good night");
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("section") === "trending") {
      const el = document.getElementById("trending-section");
      if (el) {
        const timer = setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 180);
        return () => clearTimeout(timer);
      }
    }
  }, [location.search, isLoading]);

  useEffect(() => {
    let isMounted = true;

    async function loadSongs() {
      try {
        const [songData, recommendedSongs, recentSongs] = await Promise.all([
          listSongs({ limit: 60 }),
          isAuthenticated ? getRecommendations().catch(() => []) : [],
          isAuthenticated ? getRecentlyPlayed().catch(() => []) : [],
        ]);

        if (isMounted) {
          setSongs(songData.songs || []);
          setRecommendations(recommendedSongs || []);
          setRecentlyPlayed(recentSongs || []);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.message ?? "Songs unavailable");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSongs();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Dynamically compute the genres list from actual songs in the database combined with standard defaults
  const genres = useMemo(() => {
    const uniqueGenres = new Set(DEFAULT_GENRES);
    songs.forEach((song) => {
      if (song.genre) {
        const trimmed = song.genre.trim();
        if (trimmed) {
          const capitalized = trimmed
            .split(/\s+/)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");
          uniqueGenres.add(capitalized);
        }
      }
    });
    return Array.from(uniqueGenres);
  }, [songs]);

  // Filter songs by selected genre
  const filteredSongs = useMemo(() => {
    return selectedGenre === "All"
      ? songs
      : songs.filter(
          (s) =>
            s.genre?.trim().toLowerCase() === selectedGenre.toLowerCase()
        );
  }, [songs, selectedGenre]);

  const filteredRecommendations = useMemo(() => {
    return selectedGenre === "All"
      ? recommendations
      : recommendations.filter(
          (s) =>
            s.genre?.trim().toLowerCase() === selectedGenre.toLowerCase()
        );
  }, [recommendations, selectedGenre]);

  const filteredRecentlyPlayed = useMemo(() => {
    return selectedGenre === "All"
      ? recentlyPlayed
      : recentlyPlayed.filter(
          (s) =>
            s.genre?.trim().toLowerCase() === selectedGenre.toLowerCase()
        );
  }, [recentlyPlayed, selectedGenre]);

  // Derive trending songs by playCount from the active set of filtered songs
  const trendingSongs = useMemo(() => {
    return [...filteredSongs]
      .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
      .slice(0, 15);
  }, [filteredSongs]);

  const formattedName =
    isAuthenticated && user?.name
      ? user.name
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : "Music Lover";

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 md:py-10 space-y-12">
      {/* ── Welcome Hero Banner ── */}
      <div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-neutral-900 to-zinc-950 p-6 md:p-10 border border-white/[0.06] animate-fade-in ambient-hero-glow"
        style={{
          boxShadow: `0 0 80px rgba(${r},${g},${b},0.10), 0 20px 60px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Animated glow spots */}
        <div
          className="absolute -top-20 -left-20 h-44 w-44 rounded-full blur-3xl animate-pulse-glow pointer-events-none"
          style={{ background: `rgba(${r},${g},${b},0.18)`, transition: "background 1.2s ease" }}
        />
        <div className="absolute -bottom-20 -right-20 h-44 w-44 rounded-full bg-blue-500/[0.08] blur-3xl pointer-events-none" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full blur-[80px] opacity-[0.06] pointer-events-none"
          style={{ background: `rgb(${r},${g},${b})`, transition: "background 1.2s ease" }}
        />

        <div className="relative z-10 max-w-2xl">
          <span
            className="text-xs font-black uppercase tracking-widest transition-colors duration-1000"
            style={{ color: `rgb(${r},${g},${b})` }}
          >
            Now Streaming
          </span>
          <h2 className="mt-2 text-3xl font-black md:text-5xl tracking-tight text-white leading-tight">
            {greeting}, {formattedName}
          </h2>
          <p className="mt-3 text-sm md:text-base text-zinc-400 font-semibold leading-relaxed">
            Your gateway to pure acoustic bliss. Immerse yourself in a
            handpicked collection of high-fidelity hits, spanning from golden
            nostalgic classics to the latest chart-topping Punjabi, Haryanvi,
            and Bollywood sensations.
          </p>
        </div>
      </div>

      {/* ── Genre/Category Filter Bar ── */}
      <div className="animate-slide-up-soft" style={{ animationDelay: "100ms" }}>
        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">
          Browse Categories
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {genres.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => {
                if (genre === "All") {
                  setSelectedGenre("All");
                } else {
                  navigate(`/categories/${encodeURIComponent(genre)}`);
                }
              }}
              className={`rounded-full px-5 py-2.5 text-xs font-extrabold tracking-wider uppercase transition-all duration-250 shrink-0 active:scale-95 ${
                selectedGenre === genre
                  ? "text-black shadow-lg scale-105"
                  : "bg-white/[0.04] text-white hover:bg-white/[0.08] hover:scale-[1.02] border border-white/[0.04]"
              }`}
              style={
                selectedGenre === genre
                  ? {
                      background: `linear-gradient(135deg, rgb(${r},${g},${b}), rgb(${Math.min(r + 30, 255)},${Math.min(g + 30, 255)},${Math.min(b + 60, 255)}))`,
                      boxShadow: `0 4px 16px rgba(${r},${g},${b},0.35)`,
                    }
                  : {}
              }
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error & Loading ── */}
      <StatusMessage variant="error">{error}</StatusMessage>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 animate-fade-in">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent border-r-transparent border-b-transparent"
            style={{ borderTopColor: `rgb(${r},${g},${b})` }}
          />
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            Loading tracks...
          </p>
        </div>
      ) : null}

      {!isLoading && !error && (
        <div className="space-y-14">
          {/* Recently Played */}
          {isAuthenticated && filteredRecentlyPlayed.length > 0 && (
            <div className="animate-slide-up-soft" style={{ animationDelay: "150ms" }}>
              <h3 className="text-xl font-extrabold tracking-tight text-white md:text-2xl mb-6">
                Recently Played
              </h3>
              <Carousel>
                {filteredRecentlyPlayed.map((song) => (
                  <div key={`recent-${song.id}`} className="w-40 sm:w-48 shrink-0">
                    <SongCard
                      song={song}
                      songs={filteredRecentlyPlayed}
                      favoriteIds={favoriteIds}
                      onToggleFavorite={toggleFavorite}
                    />
                  </div>
                ))}
              </Carousel>
            </div>
          )}

          {/* Recommendations */}
          {filteredRecommendations.length > 0 && (
            <div className="animate-slide-up-soft" style={{ animationDelay: "200ms" }}>
              <h3 className="text-xl font-extrabold tracking-tight text-white md:text-2xl mb-6">
                Made For You
              </h3>
              <Carousel>
                {filteredRecommendations.map((song) => (
                  <div key={`rec-${song.id}`} className="w-40 sm:w-48 shrink-0">
                    <SongCard
                      song={song}
                      songs={filteredRecommendations}
                      favoriteIds={favoriteIds}
                      onToggleFavorite={isAuthenticated ? toggleFavorite : null}
                    />
                  </div>
                ))}
              </Carousel>
            </div>
          )}

          {/* Trending */}
          {trendingSongs.length > 0 && (
            <div id="trending-section" className="animate-slide-up-soft" style={{ animationDelay: "250ms" }}>
              <h3 className="text-xl font-extrabold tracking-tight text-white md:text-2xl mb-6">
                Trending{" "}
                {selectedGenre === "All"
                  ? "Right Now"
                  : `in ${selectedGenre}`}
              </h3>
              <Carousel>
                {trendingSongs.map((song) => (
                  <div key={`trending-${song.id}`} className="w-40 sm:w-48 shrink-0">
                    <SongCard
                      song={song}
                      songs={trendingSongs}
                      favoriteIds={favoriteIds}
                      onToggleFavorite={isAuthenticated ? toggleFavorite : null}
                    />
                  </div>
                ))}
              </Carousel>
            </div>
          )}

          {/* Featured Tracks */}
          <div className="animate-slide-up-soft" style={{ animationDelay: "300ms" }}>
            <div className="flex items-baseline justify-between border-b border-white/[0.06] pb-3 mb-6">
              <h3 className="text-xl font-extrabold tracking-tight text-white md:text-2xl">
                {selectedGenre === "All"
                  ? "Featured Tracks"
                  : `${selectedGenre} Hits`}
              </h3>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                {filteredSongs.length}{" "}
                {filteredSongs.length === 1 ? "Song" : "Songs"}
              </span>
            </div>

            {filteredSongs.length > 0 ? (
              <Carousel>
                {filteredSongs.map((song) => (
                  <div key={`featured-${song.id}`} className="w-40 sm:w-48 shrink-0">
                    <SongCard
                      song={song}
                      songs={filteredSongs}
                      favoriteIds={favoriteIds}
                      onToggleFavorite={isAuthenticated ? toggleFavorite : null}
                    />
                  </div>
                ))}
              </Carousel>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-white/[0.06] bg-white/[0.01]">
                <p className="text-sm font-semibold text-zinc-400">
                  No tracks in this category yet.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
