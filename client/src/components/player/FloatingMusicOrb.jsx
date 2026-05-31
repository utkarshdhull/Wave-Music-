import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { resolveMediaUrl } from "../../utils/media";
import { Music } from "lucide-react";
import { useRef } from "react";

export function FloatingMusicOrb() {
  const {
    currentTrack,
    isPlaying,
    dynamicColor,
    setIsFullScreen,
    setIsVisualizerOn,
  } = useAudioPlayer();

  const clickTimer = useRef(null);

  if (!currentTrack) return null;

  const r = dynamicColor?.r ?? 29;
  const g = dynamicColor?.g ?? 185;
  const b = dynamicColor?.b ?? 84;
  const accentRgba = (a) => `rgba(${r},${g},${b},${a})`;

  const handleClick = () => {
    // Debounce to separate single vs double click
    if (clickTimer.current) return;
    clickTimer.current = setTimeout(() => {
      // Single click → open visualizer
      setIsVisualizerOn(true);
      setIsFullScreen(true);
      clickTimer.current = null;
    }, 220);
  };

  const handleDoubleClick = (e) => {
    e.preventDefault();
    // Cancel single-click timer
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    // Double click → open full-screen player
    setIsFullScreen(true);
  };

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`fixed bottom-[108px] right-5 z-40 h-14 w-14 cursor-pointer rounded-full flex items-center justify-center overflow-hidden transition-all duration-500 hover:scale-110 active:scale-95 group animate-orb-float ${
        isPlaying ? "animate-orb-glow" : ""
      }`}
      style={{
        background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.15), rgba(0,0,0,0.6))`,
        border: `1.5px solid ${accentRgba(0.35)}`,
        boxShadow: isPlaying
          ? `0 0 25px ${accentRgba(0.5)}, 0 0 8px ${accentRgba(0.3)}, inset 0 0 12px ${accentRgba(0.2)}`
          : `0 10px 30px rgba(0,0,0,0.5), 0 0 8px ${accentRgba(0.2)}`,
        transition: "border-color 1s ease, box-shadow 1s ease",
      }}
      role="button"
      tabIndex={0}
      aria-label="Music orb – click for visualizer, double-click for full-screen player"
      title="Click: Visualizer · Double-click: Full Player"
    >
      {currentTrack.coverUrl ? (
        <img
          src={resolveMediaUrl(currentTrack.coverUrl)}
          alt="Now playing"
          className={`h-full w-full object-cover select-none transition-transform duration-[6s] ${
            isPlaying ? "animate-[spin_14s_linear_infinite]" : ""
          }`}
          draggable={false}
        />
      ) : (
        <Music size={20} className="text-wave-accent animate-pulse" />
      )}

      {/* Pulsing outer ring */}
      {isPlaying && (
        <>
          <div
            className="absolute inset-0 rounded-full border-2 border-wave-accent/25 animate-ping pointer-events-none"
            style={{ animationDuration: "2.2s", borderColor: accentRgba(0.25) }}
          />
          <div
            className="absolute -inset-1 rounded-full border border-wave-accent/10 animate-ping pointer-events-none"
            style={{ animationDuration: "3s", borderColor: accentRgba(0.12) }}
          />
        </>
      )}

      {/* Glossy overlay */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/[0.12] via-transparent to-transparent pointer-events-none" />

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 pointer-events-none">
        <div className="bg-black/90 backdrop-blur-xl border border-white/[0.08] rounded-xl px-3 py-2 shadow-2xl whitespace-nowrap">
          <span className="text-white text-xs font-bold block truncate max-w-[130px]">
            {currentTrack.title}
          </span>
          <span className="text-zinc-500 text-[10px] font-semibold block mt-0.5">
            {currentTrack.artist}
          </span>
          <span className="text-zinc-600 text-[9px] font-black uppercase tracking-wider block mt-1">
            Click · Visualizer
          </span>
        </div>
      </div>
    </div>
  );
}
