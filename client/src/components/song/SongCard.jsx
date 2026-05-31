import { Heart, Pause, Play } from "lucide-react";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { resolveMediaUrl } from "../../utils/media";
import { EqualizerBars } from "../player/EqualizerBars";

export function SongCard({ song, songs, favoriteIds, onToggleFavorite }) {
  const { currentTrack, isPlaying, playTrack, togglePlay, dynamicColor } = useAudioPlayer();

  const isCurrent = currentTrack?.id === song.id;
  const isCurrentPlaying = isCurrent && isPlaying;
  const isFavorite = favoriteIds?.has(song.id);

  const r = dynamicColor?.r ?? 29;
  const g = dynamicColor?.g ?? 185;
  const b = dynamicColor?.b ?? 84;

  function handlePlayClick(e) {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(song, songs);
    }
  }

  return (
    <div
      onClick={() => (isCurrent ? togglePlay() : playTrack(song, songs))}
      className="group relative cursor-pointer rounded-xl glass-panel p-3.5 song-card-hover hover:-translate-y-1.5 hover:border-white/[0.12]"
      style={
        isCurrent
          ? {
              borderColor: `rgba(${r},${g},${b},0.2)`,
              boxShadow: `0 0 30px rgba(${r},${g},${b},0.08), 0 12px 40px rgba(0,0,0,0.5)`,
            }
          : {}
      }
    >
      {/* Cover Art */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-zinc-800 shadow-md">
        {song.coverUrl ? (
          <img
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            src={resolveMediaUrl(song.coverUrl)}
            alt={`${song.title} cover`}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-900 text-3xl font-black text-zinc-500 select-none">
            {song.title?.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
          <button
            type="button"
            onClick={handlePlayClick}
            className="flex h-13 w-13 items-center justify-center rounded-full text-black shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
            style={{
              background: `linear-gradient(135deg, rgb(${r},${g},${b}), rgb(${Math.min(r + 30, 255)},${Math.min(g + 20, 255)},${Math.min(b + 50, 255)}))`,
              boxShadow: `0 4px 20px rgba(${r},${g},${b},0.5)`,
              width: "52px",
              height: "52px",
            }}
            aria-label={isCurrentPlaying ? "Pause" : "Play"}
          >
            {isCurrentPlaying ? (
              <Pause size={22} fill="currentColor" />
            ) : (
              <Play size={22} className="ml-0.5" fill="currentColor" />
            )}
          </button>
        </div>

        {/* Currently playing indicator */}
        {isCurrent && (
          <div className="absolute bottom-2 left-2 z-10">
            <EqualizerBars color={`rgb(${r},${g},${b})`} size="sm" paused={!isPlaying} />
          </div>
        )}

        {/* Favorite Heart */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(song);
            }}
            className={`absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md border bg-black/40 transition-all duration-200 hover:scale-110 active:scale-90 ${
              isFavorite
                ? "text-red-400 border-red-400/20"
                : "text-zinc-300 border-white/5 hover:text-white"
            }`}
            aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
          >
            <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        )}
      </div>

      {/* Track Details */}
      <div className="mt-3 min-w-0">
        <h4
          className={`truncate text-sm font-bold tracking-wide transition-colors ${
            isCurrent ? "neon-text" : "text-white group-hover:text-wave-accent"
          }`}
          style={isCurrent ? { color: `rgb(${r},${g},${b})` } : {}}
        >
          {song.title}
        </h4>
        <p className="mt-1 truncate text-xs font-semibold text-zinc-400">
          {song.artist}
        </p>
        <span className="mt-2 inline-block rounded-md bg-white/[0.04] border border-white/[0.03] px-2 py-0.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          {song.genre || "Single"}
        </span>
      </div>
    </div>
  );
}
