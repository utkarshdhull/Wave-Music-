import { Heart, Pause, Play, Clock } from "lucide-react";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { resolveMediaUrl } from "../../utils/media";
import { EmptyState } from "../ui/EmptyState";
import { EqualizerBars } from "../player/EqualizerBars";

export function SongList({
  emptyMessage = "No songs yet.",
  favoriteIds,
  onToggleFavorite,
  renderAction,
  songs,
}) {
  const { currentTrack, isPlaying, playTrack, togglePlay, dynamicColor } =
    useAudioPlayer();

  const r = dynamicColor?.r ?? 29;
  const g = dynamicColor?.g ?? 185;
  const b = dynamicColor?.b ?? 84;
  const accentRgb = `rgb(${r},${g},${b})`;

  if (!songs.length) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="mt-6 flex flex-col gap-1">
      {/* Table Header */}
      <div className="grid grid-cols-[40px_1fr_auto] items-center gap-4 px-4 py-2 text-xs font-bold text-zinc-500 uppercase tracking-widest sm:grid-cols-[40px_2.5fr_1.5fr_auto]">
        <div className="text-center">#</div>
        <div>Title</div>
        <div className="hidden sm:block">Album / Genre</div>
        <div className="flex justify-end pr-3">
          <Clock size={14} />
        </div>
      </div>

      {/* Table Rows */}
      <div className="space-y-1 stagger-children">
        {songs.map((song, index) => {
          const isCurrent = currentTrack?.id === song.id;
          const isCurrentPlaying = isCurrent && isPlaying;
          const isFavorite = favoriteIds?.has(song.id);

          return (
            <div
              key={song.id}
              onClick={() =>
                isCurrent ? togglePlay() : playTrack(song, songs)
              }
              className={`grid grid-cols-[40px_1fr_auto] items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-250 group sm:grid-cols-[40px_2.5fr_1.5fr_auto] animate-fade-in ${
                isCurrent
                  ? "glass-panel-light border-white/[0.08]"
                  : "border border-transparent hover:bg-white/[0.04] hover:border-white/[0.04]"
              }`}
              style={
                isCurrent
                  ? {
                      boxShadow: `0 0 25px rgba(${r},${g},${b},0.06), 0 4px 20px rgba(0,0,0,0.3)`,
                      borderColor: `rgba(${r},${g},${b},0.12)`,
                    }
                  : {}
              }
            >
              {/* Play/Index cell */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    isCurrent ? togglePlay() : playTrack(song, songs);
                  }}
                  className="relative flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 group-hover:bg-white/10 group-hover:text-white transition-all active:scale-90"
                  aria-label={isCurrentPlaying ? "Pause" : "Play"}
                >
                  <span className="block group-hover:hidden text-sm font-semibold text-zinc-500">
                    {isCurrent ? (
                      <EqualizerBars
                        color={accentRgb}
                        size="sm"
                        paused={!isPlaying}
                      />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="hidden group-hover:block">
                    {isCurrentPlaying ? (
                      <Pause size={14} fill="currentColor" />
                    ) : (
                      <Play size={14} fill="currentColor" />
                    )}
                  </span>
                </button>
              </div>

              {/* Title & Cover Cell */}
              <div className="flex min-w-0 items-center gap-3.5">
                <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-zinc-800 shadow border border-white/[0.06]">
                  {song.coverUrl ? (
                    <img
                      className="h-full w-full object-cover"
                      src={resolveMediaUrl(song.coverUrl)}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-700 text-sm font-bold text-zinc-400">
                      {song.title?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className={`truncate text-sm font-bold tracking-wide transition-colors ${
                      isCurrent ? "" : "text-white"
                    }`}
                    style={isCurrent ? { color: accentRgb } : {}}
                  >
                    {song.title}
                  </p>
                  <p className="truncate text-xs font-semibold text-zinc-400 mt-0.5">
                    {song.artist}
                  </p>
                </div>
              </div>

              {/* Genre/Album Cell */}
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-xs font-semibold text-zinc-400">
                  {song.album || song.genre || "Single"}
                </p>
              </div>

              {/* Actions Cell */}
              <div className="flex items-center justify-end gap-1.5 pr-1">
                {onToggleFavorite ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(song);
                    }}
                    className={`grid h-8 w-8 place-items-center rounded-full hover:bg-white/10 transition-all duration-200 active:scale-90 ${
                      isFavorite
                        ? "text-red-400"
                        : "text-zinc-500 hover:text-white"
                    }`}
                    aria-label={
                      isFavorite ? "Remove favorite" : "Add favorite"
                    }
                  >
                    <Heart
                      size={14}
                      fill={isFavorite ? "currentColor" : "none"}
                    />
                  </button>
                ) : null}
                {renderAction ? (
                  <div onClick={(e) => e.stopPropagation()}>
                    {renderAction(song)}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
