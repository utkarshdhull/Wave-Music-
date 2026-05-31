import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { recordSongPlay } from "../api/songApi";
import { resolveMediaUrl } from "../utils/media";
import { getDominantColor } from "../utils/colorExtractor";

export const AudioPlayerContext = createContext(null);

export function AudioPlayerProvider({ children }) {
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);

  const [queue, setQueue] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off");

  const [analyser, setAnalyser] = useState(null);
  const [dynamicColor, setDynamicColor] = useState({ r: 29, g: 185, b: 84 }); // Default emerald green

  // Full Screen & Visualizer states
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isVisualizerOn, setIsVisualizerOn] = useState(true);
  const [visualizerMode, setVisualizerMode] = useState("circle"); // circle | bar | waveform
  const [playerViewMode, setPlayerViewMode] = useState("vinyl"); // standard | vinyl

  const currentIndex = useMemo(
    () => queue.findIndex((track) => track.id === currentTrack?.id),
    [currentTrack, queue]
  );

  // Lazy Web Audio API initialization
  const getAnalyser = useCallback(() => {
    if (analyserRef.current) return analyserRef.current;
    if (!audioRef.current) return null;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 256;

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyserNode);
      analyserNode.connect(ctx.destination);

      audioContextRef.current = ctx;
      analyserRef.current = analyserNode;
      setAnalyser(analyserNode);
      return analyserNode;
    } catch (e) {
      console.warn("Web Audio API not supported or initialization blocked:", e);
      return null;
    }
  }, []);

  const playTrack = useCallback((track, nextQueue = []) => {
    setQueue(nextQueue.length ? nextQueue : [track]);
    setCurrentTrack(track);
    setIsPlaying(true);
    recordSongPlay(track.id).catch(() => {});
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentTrack) {
      return;
    }
    setIsPlaying((current) => !current);
  }, [currentTrack]);

  const seek = useCallback((value) => {
    const nextTime = Number(value);

    if (audioRef.current) {
      audioRef.current.currentTime = nextTime;
    }

    setCurrentTime(nextTime);
  }, []);

  const setVolume = useCallback((value) => {
    const nextVolume = Number(value);
    setVolumeState(nextVolume);

    if (audioRef.current) {
      audioRef.current.volume = nextVolume;
    }
  }, []);

  const playNext = useCallback(() => {
    if (!queue.length || !currentTrack) {
      return;
    }

    if (isShuffle && queue.length > 1) {
      const availableTracks = queue.filter((track) => track.id !== currentTrack.id);
      const nextTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)];
      playTrack(nextTrack, queue);
      return;
    }

    const nextIndex = currentIndex + 1;

    if (nextIndex < queue.length) {
      playTrack(queue[nextIndex], queue);
      return;
    }

    if (repeatMode === "all") {
      playTrack(queue[0], queue);
      return;
    }

    setIsPlaying(false);
  }, [currentIndex, currentTrack, isShuffle, playTrack, queue, repeatMode]);

  const playPrevious = useCallback(() => {
    if (!queue.length || !currentTrack) {
      return;
    }

    if (currentIndex <= 0) {
      if (repeatMode === "all") {
        playTrack(queue[queue.length - 1], queue);
      } else {
        seek(0); // Remain on the first song and reset playback time
      }
      return;
    }

    playTrack(queue[currentIndex - 1], queue);
  }, [currentIndex, currentTrack, playTrack, queue, repeatMode, seek]);


  const toggleRepeat = useCallback(() => {
    setRepeatMode((current) => {
      if (current === "off") {
        return "one";
      }

      if (current === "one") {
        return "all";
      }

      return "off";
    });
  }, []);

  // Update dynamic album coloring variables on track change
  useEffect(() => {
    if (!currentTrack || !currentTrack.coverUrl) {
      setDynamicColor({ r: 29, g: 185, b: 84 }); // default green
      return;
    }

    const coverSrc = resolveMediaUrl(currentTrack.coverUrl);
    getDominantColor(coverSrc).then((color) => {
      if (color) {
        setDynamicColor(color);
      } else {
        setDynamicColor({ r: 29, g: 185, b: 84 });
      }
    });
  }, [currentTrack]);

  // Inject colors into document root
  useEffect(() => {
    const root = document.documentElement;
    const color = dynamicColor || { r: 29, g: 185, b: 84 };
    const { r, g, b } = color;
    root.style.setProperty("--dynamic-color-r", String(r));
    root.style.setProperty("--dynamic-color-g", String(g));
    root.style.setProperty("--dynamic-color-b", String(b));
  }, [dynamicColor]);

  useEffect(() => {
    if (!audioRef.current || !currentTrack) {
      return;
    }

    audioRef.current.src = resolveMediaUrl(currentTrack.audioUrl);
    audioRef.current.volume = volume;
    if (isPlaying) {
      getAnalyser();
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return undefined;
    }

    if (isPlaying) {
      getAnalyser();
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }

    return undefined;
  }, [isPlaying, getAnalyser]);

  const value = useMemo(
    () => ({
      currentTime,
      currentTrack,
      duration,
      isPlaying,
      isShuffle,
      playNext,
      playPrevious,
      playTrack,
      queue,
      repeatMode,
      seek,
      setIsShuffle,
      setVolume,
      togglePlay,
      toggleRepeat,
      volume,
      analyser,
      dynamicColor,
      isFullScreen,
      setIsFullScreen,
      isVisualizerOn,
      setIsVisualizerOn,
      visualizerMode,
      setVisualizerMode,
      playerViewMode,
      setPlayerViewMode
    }),
    [
      currentTime,
      currentTrack,
      duration,
      isPlaying,
      isShuffle,
      playNext,
      playPrevious,
      playTrack,
      queue,
      repeatMode,
      seek,
      setVolume,
      togglePlay,
      toggleRepeat,
      volume,
      analyser,
      dynamicColor,
      isFullScreen,
      isVisualizerOn,
      visualizerMode,
      playerViewMode
    ]
  );

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onDurationChange={(event) => setDuration(event.currentTarget.duration || 0)}
        onEnded={() => {
          if (repeatMode === "one" && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => setIsPlaying(false));
            return;
          }

          playNext();
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
      />
    </AudioPlayerContext.Provider>
  );
}
