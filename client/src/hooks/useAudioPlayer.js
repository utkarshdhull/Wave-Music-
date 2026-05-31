import { useContext } from "react";
import { AudioPlayerContext } from "../context/AudioPlayerContext";

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);

  if (!context) {
    throw new Error("useAudioPlayer must be used inside AudioPlayerProvider");
  }

  return context;
}

