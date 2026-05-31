import { ArrowLeft, Play, Pause, Disc, Music } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { listSongs } from "../api/songApi";
import { SongList } from "../components/song/SongList";
import { StatusMessage } from "../components/ui/StatusMessage";
import { useFavorites } from "../hooks/useFavorites";
import { useAuth } from "../hooks/useAuth";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { resolveMediaUrl } from "../utils/media";
import { getDominantColor } from "../utils/colorExtractor";

export function CategoryDetail() {
  const { genre } = useParams();
  const decodedGenre = decodeURIComponent(genre);
  
  const { isAuthenticated } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudioPlayer();

  const [songs, setSongs] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [categoryColor, setCategoryColor] = useState({ r: 29, g: 185, b: 84 }); // Default green

  useEffect(() => {
    let isMounted = true;

    async function loadCategorySongs() {
      try {
        const data = await listSongs({ limit: 150 });
        const filtered = (data.songs || []).filter(
          (s) => s.genre?.trim().toLowerCase() === decodedGenre.toLowerCase()
        );

        if (isMounted) {
          setSongs(filtered);
          
          // Try to extract dominant theme color from first song cover if available
          const firstCover = filtered.find((s) => s.coverUrl)?.coverUrl;
          if (firstCover) {
            getDominantColor(resolveMediaUrl(firstCover)).then((color) => {
              if (isMounted && color) {
                setCategoryColor(color);
              }
            });
          }
        }
      } catch (err) {
        if (isMounted) {
          setError("Could not load category tracks. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCategorySongs();

    return () => {
      isMounted = false;
    };
  }, [decodedGenre]);

  const isCurrentGenrePlaying = useMemo(() => {
    return (
      isPlaying &&
      currentTrack &&
      currentTrack.genre?.trim().toLowerCase() === decodedGenre.toLowerCase()
    );
  }, [currentTrack, isPlaying, decodedGenre]);

  const handlePlayCategory = () => {
    if (songs.length === 0) return;

    if (isCurrentGenrePlaying) {
      togglePlay();
    } else {
      // Find index of current playing track if it matches, otherwise play first
      const firstTrack = songs[0];
      playTrack(firstTrack, songs);
    }
  };

  const bgStyle = {
    background: `radial-gradient(circle at 20% 20%, rgba(${categoryColor.r}, ${categoryColor.g}, ${categoryColor.b}, 0.15) 0%, transparent 60%)`
  };

  return (
    <section 
      style={bgStyle}
      className="mx-auto max-w-7xl px-5 py-8 md:py-10 min-h-screen transition-all duration-1000"
    >
      {/* Back navigation */}
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Home
      </Link>

      {/* Category Hero Block */}
      <div className="relative mt-6 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent p-6 md:p-10 shadow-2xl backdrop-blur-md">
        {/* Dynamic accent glow */}
        <div 
          style={{ backgroundColor: `rgba(${categoryColor.r}, ${categoryColor.g}, ${categoryColor.b}, 0.12)` }}
          className="absolute -top-32 -left-32 h-72 w-72 rounded-full blur-3xl transition-all duration-1000" 
        />

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end">
          {/* Decorative Genre Card Art with dynamic neon border */}
          <div 
            style={{ 
              borderColor: `rgba(${categoryColor.r}, ${categoryColor.g}, ${categoryColor.b}, 0.25)`,
              boxShadow: `0 20px 40px rgba(${categoryColor.r}, ${categoryColor.g}, ${categoryColor.b}, 0.1)`
            }}
            className="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl bg-zinc-950 flex flex-col items-center justify-center border text-white group"
          >
            {songs[0]?.coverUrl ? (
              <img 
                src={resolveMediaUrl(songs[0].coverUrl)} 
                alt="" 
                className="absolute inset-0 h-full w-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-500" 
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 to-black opacity-80" />
            )}
            <Music size={42} className="relative z-10 text-zinc-400 group-hover:scale-110 transition-transform" />
            <span className="absolute bottom-4 left-4 text-[9px] font-black uppercase tracking-widest text-zinc-500">Wave Genre</span>
          </div>

          <div className="min-w-0 flex-1">
            <span 
              style={{ 
                color: `rgb(${categoryColor.r}, ${categoryColor.g}, ${categoryColor.b})`,
                borderColor: `rgba(${categoryColor.r}, ${categoryColor.g}, ${categoryColor.b}, 0.15)`,
                backgroundColor: `rgba(${categoryColor.r}, ${categoryColor.g}, ${categoryColor.b}, 0.08)`
              }}
              className="text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border inline-block"
            >
              Browse Category
            </span>
            <h2 className="mt-3 text-3xl font-black md:text-5xl lg:text-6xl tracking-tight text-white leading-none capitalize">
              {decodedGenre}
            </h2>
            
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold text-zinc-400">
              <span className="text-white font-bold">
                {songs.length} {songs.length === 1 ? "track" : "tracks"}
              </span>
              <span className="h-1 w-1 rounded-full bg-zinc-600" />
              <span>Curated collection for Category Fans</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Bar */}
      {songs.length > 0 && (
        <div className="mt-8 flex items-center gap-4">
          <button
            type="button"
            onClick={handlePlayCategory}
            style={{ 
              backgroundColor: `rgb(${categoryColor.r}, ${categoryColor.g}, ${categoryColor.b})`,
              boxShadow: `0 8px 24px rgba(${categoryColor.r}, ${categoryColor.g}, ${categoryColor.b}, 0.25)`
            }}
            className="flex items-center gap-2 rounded-full text-black hover:scale-105 active:scale-95 px-8 py-3.5 text-xs font-black uppercase tracking-wider transition-all duration-200"
          >
            {isCurrentGenrePlaying ? (
              <>
                <Pause size={16} fill="currentColor" />
                Pause
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                Play All
              </>
            )}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="mt-16 flex flex-col items-center justify-center gap-3 py-10">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-t-zinc-400 border-r-transparent border-b-transparent border-l-transparent" />
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Loading genre catalogue...</p>
        </div>
      ) : null}

      <StatusMessage variant="error">{error}</StatusMessage>

      {/* Category Songs List */}
      {!isLoading && !error && (
        <div className="mt-10">
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-base font-extrabold tracking-tight text-white">
              Category Tracks
            </h3>
          </div>
          <SongList
            emptyMessage={`No tracks found under "${decodedGenre}" category yet.`}
            songs={songs}
            favoriteIds={favoriteIds}
            onToggleFavorite={isAuthenticated ? toggleFavorite : null}
          />
        </div>
      )}
    </section>
  );
}
