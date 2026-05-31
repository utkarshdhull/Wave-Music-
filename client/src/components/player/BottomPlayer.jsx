import {
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ChevronDown,
  Maximize2,
  Disc,
  Layout,
  Tv,
  Heart,
  Plus,
  ListMusic,
  Mic2,
  BarChart2,
  X,
} from "lucide-react";
import { useState, useCallback } from "react";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { resolveMediaUrl } from "../../utils/media";
import { Visualizer } from "./Visualizer";
import { EqualizerBars } from "./EqualizerBars";

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// Progress fill % for styled range
function progressPct(current, total) {
  if (!total) return 0;
  return Math.min((current / total) * 100, 100);
}

export function BottomPlayer() {
  const {
    currentTime,
    currentTrack,
    duration,
    isPlaying,
    isShuffle,
    playNext,
    playPrevious,
    repeatMode,
    seek,
    setIsShuffle,
    setVolume,
    togglePlay,
    toggleRepeat,
    volume,
    analyser,
    dynamicColor,
    queue,
    isFullScreen,
    setIsFullScreen,
    isVisualizerOn,
    setIsVisualizerOn,
    visualizerMode,
    setVisualizerMode,
    playerViewMode,
    setPlayerViewMode,
  } = useAudioPlayer();

  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.8);

  const r = dynamicColor?.r ?? 29;
  const g = dynamicColor?.g ?? 185;
  const b = dynamicColor?.b ?? 84;
  const accentRgb = `rgb(${r},${g},${b})`;
  const accentRgba = (a) => `rgba(${r},${g},${b},${a})`;

  const handleMuteToggle = useCallback(() => {
    if (isMuted) {
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  }, [isMuted, volume, prevVolume, setVolume]);

  const seekPct = progressPct(currentTime, duration);

  return (
    <>
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MINI BOTTOM PLAYER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div
        className="fixed bottom-4 left-4 right-4 z-30 rounded-2xl text-white md:left-[272px] md:right-6 transition-all duration-500 ambient-glow-player glass-premium"
        style={{
          boxShadow: `0 0 50px ${accentRgba(0.1)}, 0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.07)`,
        }}
      >
        {/* Progress bar – top of player */}
        <div className="relative h-[3px] w-full rounded-t-2xl overflow-hidden cursor-pointer group">
          <div className="absolute inset-0 bg-white/[0.07]" />
          <div
            className="absolute inset-y-0 left-0 transition-none"
            style={{
              width: `${seekPct}%`,
              background: `linear-gradient(90deg, ${accentRgb}, ${accentRgba(0.7)})`,
              boxShadow: `0 0 6px ${accentRgba(0.6)}`,
              transition: "background 1s ease",
            }}
          />
          {/* Invisible full-width seek trigger */}
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={Math.min(currentTime, duration || 0)}
            onChange={(e) => seek(e.target.value)}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
            aria-label="Seek"
          />
        </div>

        <div className="px-4 py-3 md:px-5 md:py-3.5">
          <div className="mx-auto grid grid-cols-[1fr_auto] items-center gap-3 md:grid-cols-[1fr_auto_1fr]">

            {/* ── LEFT: Track info ── */}
            <div
              className="flex min-w-0 items-center gap-3 cursor-pointer group"
              onClick={() => currentTrack && setIsFullScreen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && currentTrack && setIsFullScreen(true)}
              aria-label="Open full screen player"
            >
              {/* Album art */}
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] shadow-md">
                {currentTrack?.coverUrl ? (
                  <img
                    className={`h-full w-full object-cover transition-transform duration-[6s] ${
                      isPlaying ? "animate-[spin_20s_linear_infinite]" : ""
                    }`}
                    src={resolveMediaUrl(currentTrack.coverUrl)}
                    alt=""
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-900 font-black text-zinc-500">
                    W
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                  <Maximize2 size={13} className="text-white" />
                </div>
              </div>

              {/* Title + artist + EQ */}
              <div className="min-w-0 flex items-center gap-2">
                <div className="min-w-0">
                  <p className="max-w-[38vw] truncate text-sm font-bold text-white tracking-wide group-hover:text-wave-accent transition-colors md:max-w-[200px] xl:max-w-none">
                    {currentTrack?.title ?? "Nothing playing"}
                  </p>
                  <p className="truncate text-xs font-semibold text-zinc-400 mt-0.5">
                    {currentTrack?.artist ?? "Select a track"}
                  </p>
                </div>
                {isPlaying && currentTrack && (
                  <EqualizerBars color={accentRgb} size="sm" />
                )}
              </div>
            </div>

            {/* ── CENTER: Playback controls ── */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Shuffle */}
              <button
                type="button"
                onClick={() => setIsShuffle((v) => !v)}
                className={`hidden rounded-full p-2 transition-all duration-200 md:block ${
                  isShuffle
                    ? "text-wave-accent bg-wave-accent/10"
                    : "text-zinc-500 hover:text-zinc-200"
                }`}
                aria-label="Shuffle"
              >
                <Shuffle size={15} />
              </button>

              {/* Previous */}
              <button
                type="button"
                onClick={playPrevious}
                disabled={!currentTrack}
                className="rounded-full p-2 text-zinc-400 hover:text-white active:scale-90 transition-all disabled:opacity-25 disabled:pointer-events-none"
                aria-label="Previous"
              >
                <SkipBack size={18} fill="currentColor" />
              </button>

              {/* Play/Pause */}
              <button
                type="button"
                onClick={togglePlay}
                disabled={!currentTrack}
                className="grid h-11 w-11 place-items-center rounded-full text-black shadow-lg hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 transition-all duration-200 btn-glow"
                style={{
                  background: `linear-gradient(135deg, rgb(${r},${g},${b}), rgb(${Math.min(r+30,255)},${Math.min(g+20,255)},${Math.min(b+50,255)}))`,
                  boxShadow: `0 4px 20px ${accentRgba(0.4)}`,
                  transition: "background 1s ease, box-shadow 1s ease, transform 0.2s ease",
                }}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause size={17} className="fill-current" />
                ) : (
                  <Play size={17} className="ml-0.5 fill-current" />
                )}
              </button>

              {/* Next */}
              <button
                type="button"
                onClick={playNext}
                disabled={!currentTrack}
                className="rounded-full p-2 text-zinc-400 hover:text-white active:scale-90 transition-all disabled:opacity-25 disabled:pointer-events-none"
                aria-label="Next"
              >
                <SkipForward size={18} fill="currentColor" />
              </button>

              {/* Repeat */}
              <button
                type="button"
                onClick={toggleRepeat}
                disabled={!currentTrack}
                className={`hidden rounded-full p-2 transition-all duration-200 md:block ${
                  repeatMode !== "off"
                    ? "text-wave-accent bg-wave-accent/10"
                    : "text-zinc-500 hover:text-zinc-200"
                }`}
                aria-label="Repeat"
              >
                {repeatMode === "one" ? <Repeat1 size={15} /> : <Repeat size={15} />}
              </button>
            </div>

            {/* ── RIGHT: Volume + extras (desktop only) ── */}
            <div className="hidden items-center justify-end gap-2 md:flex">
              {/* Queue */}
              <button
                type="button"
                onClick={() => currentTrack && (setIsFullScreen(true), setShowQueue(true))}
                className={`rounded-full p-2 transition-all duration-200 ${
                  showQueue ? "text-wave-accent bg-wave-accent/10" : "text-zinc-500 hover:text-zinc-200"
                }`}
                aria-label="Queue"
                title="Queue"
              >
                <ListMusic size={15} />
              </button>

              {/* Lyrics */}
              <button
                type="button"
                onClick={() => currentTrack && (setIsFullScreen(true), setShowLyrics(true))}
                className="rounded-full p-2 text-zinc-500 hover:text-zinc-200 transition-all duration-200"
                aria-label="Lyrics"
                title="Lyrics"
              >
                <Mic2 size={15} />
              </button>

              {/* Visualizer toggle */}
              <button
                type="button"
                onClick={() => { setIsVisualizerOn(true); setIsFullScreen(true); }}
                className={`rounded-full p-2 transition-all duration-200 ${
                  isVisualizerOn ? "text-wave-accent bg-wave-accent/10" : "text-zinc-500 hover:text-zinc-200"
                }`}
                aria-label="Visualizer"
                title="Visualizer"
              >
                <BarChart2 size={15} />
              </button>

              {/* Separator */}
              <div className="h-5 w-px bg-white/10 mx-1" />

              {/* Volume */}
              <button
                type="button"
                onClick={handleMuteToggle}
                className="text-zinc-400 hover:text-white transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => { setVolume(e.target.value); setIsMuted(false); }}
                className="h-1 w-20 accent-wave-accent"
                aria-label="Volume"
              />
            </div>

            {/* Mobile time display */}
            <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 tracking-wider md:hidden justify-end">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Desktop seek + times row */}
          <div className="hidden md:grid grid-cols-[40px_1fr_40px] items-center gap-2 mt-2 text-[10px] font-extrabold text-zinc-500 tracking-wider">
            <span className="text-right">{formatTime(currentTime)}</span>
            <div className="relative h-1 w-full rounded-full overflow-hidden bg-white/[0.09] group cursor-pointer">
              <div
                className="absolute inset-y-0 left-0"
                style={{
                  width: `${seekPct}%`,
                  background: `linear-gradient(90deg, ${accentRgb}, ${accentRgba(0.7)})`,
                  boxShadow: `0 0 4px ${accentRgba(0.5)}`,
                  transition: "background 1s ease",
                }}
              />
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={Math.min(currentTime, duration || 0)}
                onChange={(e) => seek(e.target.value)}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                aria-label="Seek"
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          IMMERSIVE FULL-SCREEN PLAYER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {isFullScreen && currentTrack && (
        <div className="fixed inset-0 z-50 flex overflow-hidden text-white animate-fs-enter">
          {/* Blurred cover backdrop */}
          <div
            className="absolute inset-0 z-0 scale-110 pointer-events-none"
            style={{
              backgroundImage: `url(${resolveMediaUrl(currentTrack.coverUrl)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(80px) brightness(0.25) saturate(1.4)",
              transition: "background-image 1s ease",
            }}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 z-0 bg-black/55 pointer-events-none" />
          {/* Dynamic color tint */}
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 30%, ${accentRgba(0.12)} 0%, transparent 65%)`,
              transition: "background 1.2s ease",
            }}
          />

          {/* Canvas Visualizer */}
          {isVisualizerOn && (
            <Visualizer analyser={analyser} mode={visualizerMode} dynamicColor={dynamicColor} />
          )}

          {/* ── MAIN PLAYER PANEL ── */}
          <div className="relative z-10 flex flex-1 flex-col p-5 md:p-10 overflow-hidden">

            {/* Header row */}
            <header className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setIsFullScreen(false)}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] border border-white/[0.08] text-zinc-300 hover:text-white hover:bg-white/[0.10] active:scale-95 transition-all"
                aria-label="Close full screen player"
              >
                <ChevronDown size={20} />
              </button>

              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-zinc-400">
                Now Playing
              </span>

              {/* Right options */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => { setShowQueue(!showQueue); setShowLyrics(false); }}
                  className={`grid h-8 w-8 place-items-center rounded-full border transition-all duration-200 text-xs ${
                    showQueue
                      ? "bg-white/10 border-white/20 text-white"
                      : "border-white/[0.06] text-zinc-500 hover:text-white hover:border-white/15"
                  }`}
                  title="Queue"
                  aria-label="Queue"
                >
                  <ListMusic size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => { setShowLyrics(!showLyrics); setShowQueue(false); }}
                  className={`grid h-8 w-8 place-items-center rounded-full border transition-all duration-200 ${
                    showLyrics
                      ? "bg-white/10 border-white/20 text-white"
                      : "border-white/[0.06] text-zinc-500 hover:text-white hover:border-white/15"
                  }`}
                  title="Lyrics"
                  aria-label="Lyrics"
                >
                  <Mic2 size={14} />
                </button>
              </div>
            </header>

            {/* View mode toggles */}
            <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
              {/* Player view */}
              <div className="flex items-center gap-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] p-1 backdrop-blur">
                <button
                  type="button"
                  onClick={() => setPlayerViewMode("standard")}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                    playerViewMode === "standard"
                      ? "bg-white text-black shadow-md"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Layout size={9} /> Standard
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerViewMode("vinyl")}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                    playerViewMode === "vinyl"
                      ? "bg-white text-black shadow-md"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Disc size={9} /> Vinyl
                </button>
              </div>

              {/* Visualizer */}
              <div className="flex items-center gap-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] p-1 backdrop-blur">
                <button
                  type="button"
                  onClick={() => setIsVisualizerOn(!isVisualizerOn)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                    !isVisualizerOn ? "bg-white text-black shadow-md" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Tv size={9} /> {isVisualizerOn ? "Viz On" : "Viz Off"}
                </button>
                {isVisualizerOn && (
                  <div className="flex gap-0.5 border-l border-white/10 pl-1 ml-1">
                    {["circle", "bar", "waveform"].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setVisualizerMode(m)}
                        className={`rounded-full px-2 py-1.5 text-[8px] font-black uppercase tracking-wider transition-all duration-200 ${
                          visualizerMode === m
                            ? "text-black font-extrabold shadow-md"
                            : "text-zinc-400 hover:text-white"
                        }`}
                        style={visualizerMode === m ? { background: accentRgb } : {}}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── CENTER PIECE: Artwork ── */}
            <div className="relative flex flex-col items-center justify-center flex-1 w-full max-w-md mx-auto">
              {playerViewMode === "vinyl" ? (
                /* Vinyl mode */
                <div className="relative flex items-center justify-center bg-black/30 border border-white/[0.06] p-7 rounded-3xl backdrop-blur-md shadow-2xl w-full max-w-[300px] md:max-w-[360px]">
                  <div
                    className={`relative aspect-square w-full rounded-full bg-neutral-950 p-[11px] border-[7px] border-neutral-900 shadow-2xl vinyl-grooves ${
                      isPlaying ? "animate-spin-slow" : ""
                    }`}
                  >
                    <div className="absolute inset-[14px] rounded-full border border-dashed border-white/[0.025]" />
                    <div className="absolute inset-[28px] rounded-full border border-dashed border-white/[0.025]" />
                    <div className="absolute inset-[42px] rounded-full border border-dashed border-white/[0.025]" />
                    <div className="relative h-full w-full rounded-full overflow-hidden border border-black/40">
                      {currentTrack.coverUrl ? (
                        <img
                          className="h-full w-full object-cover select-none"
                          src={resolveMediaUrl(currentTrack.coverUrl)}
                          alt=""
                          draggable={false}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-3xl font-black text-zinc-600">W</div>
                      )}
                      <div className="absolute inset-0 m-auto h-5 w-5 rounded-full border-2 border-neutral-800 bg-neutral-950 shadow-inner" />
                    </div>
                  </div>

                  {/* Tonearm */}
                  <div
                    className="absolute top-2 right-2 z-20 origin-[24px_24px] tonearm-transition"
                    style={{ transform: isPlaying ? "rotate(23deg)" : "rotate(0deg)" }}
                  >
                    <svg width="55" height="140" viewBox="0 0 55 140" fill="none" className="drop-shadow-[0_6px_14px_rgba(0,0,0,0.6)]">
                      <circle cx="24" cy="24" r="14" fill="#1b1b1e" stroke="#333" strokeWidth="1.5" />
                      <circle cx="24" cy="24" r="5" fill="#555" />
                      <path d="M24 24 L24 100 L36 122 L36 130" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      <rect x="30" y="128" width="11" height="12" rx="1.5" fill="#1e1e24" stroke="#444" strokeWidth="0.8" />
                      <path d="M33 139 L39 139" stroke={accentRgb} strokeWidth="1.5" />
                    </svg>
                  </div>

                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-500/[0.04] to-transparent pointer-events-none" />
                </div>
              ) : (
                /* Standard cover */
                <div className="relative group max-w-xs md:max-w-sm aspect-square w-full rounded-2xl overflow-hidden border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
                  {currentTrack.coverUrl ? (
                    <img
                      className="h-full w-full object-cover transition-transform duration-[10s] ease-out group-hover:scale-[1.04]"
                      src={resolveMediaUrl(currentTrack.coverUrl)}
                      alt=""
                      draggable={false}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-6xl font-black text-zinc-600">W</div>
                  )}
                  {/* Ambient color corner glow */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 80% 80%, ${accentRgba(0.18)} 0%, transparent 60%)`,
                      transition: "background 1s ease",
                    }}
                  />
                </div>
              )}

              {/* Song info + like */}
              <div className="mt-7 text-center w-full px-4 relative z-10">
                <div className="flex items-center justify-center gap-3">
                  <div className="min-w-0">
                    <h3 className="text-2xl font-black md:text-3xl tracking-tight text-white line-clamp-1 leading-tight">
                      {currentTrack.title}
                    </h3>
                    <p className="mt-1.5 text-sm font-extrabold uppercase tracking-wide line-clamp-1 transition-colors" style={{ color: accentRgb }}>
                      {currentTrack.artist}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 h-9 w-9 flex items-center justify-center rounded-full bg-white/[0.05] border border-white/[0.08] text-zinc-400 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/10 transition-all duration-200 active:scale-90"
                    aria-label="Like song"
                  >
                    <Heart size={16} />
                  </button>
                </div>
                <span className="mt-3 inline-block rounded-md bg-white/[0.04] border border-white/[0.03] px-3 py-1 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  {currentTrack.genre || "Single"}
                </span>

                {/* Equalizer indicator inside full-screen */}
                {isPlaying && (
                  <div className="flex justify-center mt-3">
                    <EqualizerBars color={accentRgb} size="md" />
                  </div>
                )}
              </div>
            </div>

            {/* ── CONTROLS + SEEK ── */}
            <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col gap-5 mt-2 md:pb-4">

              {/* Seek timeline */}
              <div className="flex flex-col gap-2">
                <div className="relative h-1.5 w-full rounded-full overflow-hidden bg-white/10 group cursor-pointer">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${seekPct}%`,
                      background: `linear-gradient(90deg, ${accentRgb}, ${accentRgba(0.75)})`,
                      boxShadow: `0 0 8px ${accentRgba(0.55)}`,
                      transition: "background 1s ease",
                    }}
                  />
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={Math.min(currentTime, duration || 0)}
                    onChange={(e) => seek(e.target.value)}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                    aria-label="Seek timeline"
                  />
                </div>
                <div className="flex justify-between text-[11px] font-black text-zinc-500 tracking-wider">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Transport controls */}
              <div className="flex items-center justify-between px-4 sm:px-10">
                <button
                  type="button"
                  onClick={() => setIsShuffle((v) => !v)}
                  className={`rounded-full p-3 transition-all duration-200 ${
                    isShuffle ? "text-wave-accent bg-wave-accent/10" : "text-zinc-500 hover:text-white"
                  }`}
                  aria-label="Shuffle"
                >
                  <Shuffle size={19} />
                </button>

                <div className="flex items-center gap-5 sm:gap-8">
                  <button
                    type="button"
                    onClick={playPrevious}
                    className="rounded-full p-3.5 text-zinc-400 hover:text-white active:scale-90 transition-transform"
                    aria-label="Previous"
                  >
                    <SkipBack size={24} fill="currentColor" />
                  </button>
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="grid h-20 w-20 place-items-center rounded-full text-black shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
                    style={{
                      background: `linear-gradient(135deg, rgb(${r},${g},${b}), rgb(${Math.min(r+40,255)},${Math.min(g+25,255)},${Math.min(b+60,255)}))`,
                      boxShadow: `0 0 40px ${accentRgba(0.5)}, 0 8px 30px rgba(0,0,0,0.4)`,
                      transition: "background 1s ease, box-shadow 1s ease, transform 0.2s ease",
                    }}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause size={28} className="fill-current" />
                    ) : (
                      <Play size={28} className="ml-1 fill-current" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={playNext}
                    className="rounded-full p-3.5 text-zinc-400 hover:text-white active:scale-90 transition-transform"
                    aria-label="Next"
                  >
                    <SkipForward size={24} fill="currentColor" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={toggleRepeat}
                  className={`rounded-full p-3 transition-all duration-200 ${
                    repeatMode !== "off" ? "text-wave-accent bg-wave-accent/10" : "text-zinc-500 hover:text-white"
                  }`}
                  aria-label="Repeat"
                >
                  {repeatMode === "one" ? <Repeat1 size={19} /> : <Repeat size={19} />}
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center justify-center gap-3 py-3 border-t border-white/[0.06] max-w-sm mx-auto w-full">
                <button
                  type="button"
                  onClick={handleMuteToggle}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => { setVolume(e.target.value); setIsMuted(false); }}
                  className="h-1 w-full accent-wave-accent"
                  aria-label="Volume slider"
                />
              </div>
            </div>
          </div>

          {/* ── SIDE PANEL: Queue or Lyrics ── */}
          {(showQueue || showLyrics) && (
            <div className="relative z-10 hidden md:flex flex-col w-80 xl:w-96 border-l border-white/[0.06] bg-black/30 backdrop-blur-xl animate-slide-in-left">
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <h4 className="text-sm font-black uppercase tracking-widest text-zinc-300">
                  {showQueue ? "Queue" : "Lyrics"}
                </h4>
                <button
                  type="button"
                  onClick={() => { setShowQueue(false); setShowLyrics(false); }}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {showQueue && (
                <div className="flex-1 overflow-y-auto py-3 scrollbar-none space-y-1 px-3">
                  {queue.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-zinc-600 text-sm font-semibold">Queue is empty</div>
                  ) : (
                    queue.map((track, idx) => {
                      const isCurr = track.id === currentTrack?.id;
                      return (
                        <div
                          key={`q-${track.id}-${idx}`}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 cursor-default ${
                            isCurr ? "bg-white/[0.08] border border-white/[0.06]" : "hover:bg-white/[0.04]"
                          }`}
                        >
                          {/* Mini cover */}
                          <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-zinc-800">
                            {track.coverUrl ? (
                              <img src={resolveMediaUrl(track.coverUrl)} className="h-full w-full object-cover" alt="" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-zinc-600 text-xs font-black">W</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-bold truncate ${isCurr ? "text-white" : "text-zinc-300"}`}>
                              {track.title}
                            </p>
                            <p className="text-[10px] text-zinc-500 truncate font-semibold">{track.artist}</p>
                          </div>
                          {isCurr && (
                            <div className="shrink-0">
                              <EqualizerBars color={accentRgb} size="sm" paused={!isPlaying} />
                            </div>
                          )}
                          {!isCurr && (
                            <span className="text-[10px] text-zinc-600 font-black shrink-0">{idx + 1}</span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {showLyrics && (
                <div className="flex-1 overflow-y-auto py-6 px-6 scrollbar-none">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-6">
                    Lyrics · {currentTrack?.title}
                  </p>
                  {/* Lyrics shimmer placeholder */}
                  <div className="space-y-4">
                    {[80, 65, 90, 55, 75, 60, 85, 50, 70, 40, 80, 65, 55, 90].map((w, i) => (
                      <div
                        key={i}
                        className="shimmer-line h-4 rounded"
                        style={{
                          width: `${w}%`,
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                  <p className="mt-8 text-center text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
                    Lyrics coming soon
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
