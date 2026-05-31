import { useEffect, useState, useMemo } from "react";
import { Radio as RadioIcon, Play, Disc, Music } from "lucide-react";
import { listSongs } from "../api/songApi";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useAuth } from "../hooks/useAuth";
import { StatusMessage } from "../components/ui/StatusMessage";

const PRESET_GRADIENTS = [
  "from-violet-600 to-indigo-600 shadow-violet-500/10",
  "from-pink-500 to-rose-600 shadow-pink-500/10",
  "from-emerald-500 to-teal-600 shadow-emerald-500/10",
  "from-amber-500 to-orange-600 shadow-amber-500/10",
  "from-blue-600 to-cyan-500 shadow-blue-500/10",
  "from-fuchsia-600 to-purple-600 shadow-fuchsia-500/10"
];

export function Radio() {
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSongs() {
      try {
        const data = await listSongs({ limit: 150 });
        if (isMounted) {
          setSongs(data.songs || []);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to initialize radio frequencies. Please retry.");
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
  }, []);

  // Group songs by genre dynamically
  const stations = useMemo(() => {
    const map = {};
    songs.forEach((song) => {
      if (song.genre) {
        const clean = song.genre.trim();
        if (clean) {
          const key = clean.toLowerCase();
          if (!map[key]) {
            map[key] = {
              name: clean.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" "),
              tracks: []
            };
          }
          map[key].tracks.push(song);
        }
      }
    });
    return Object.values(map).sort((a, b) => b.tracks.length - a.tracks.length);
  }, [songs]);

  const handleStartRadio = (tracks) => {
    if (tracks.length === 0) return;
    
    // Create a shuffled copy of the genre queue
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    playTrack(shuffled[0], shuffled);
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 md:py-10 space-y-8">
      {/* Radio Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-neutral-950 p-6 md:p-8 shadow-2xl border border-white/5">
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-wave-accent/10 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.03] border border-white/5 text-wave-accent shadow-inner">
            <RadioIcon size={28} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black md:text-3xl tracking-tight text-white uppercase tracking-wider">
              Wave FM Stations
            </h2>
            <p className="mt-1 text-xs text-zinc-400 font-semibold leading-relaxed">
              Dynamically synthesized genre radio streams. Tune in to non-stop shuffled mixes tailored for every acoustic vibe.
            </p>
          </div>
        </div>
      </div>

      <StatusMessage variant="error">{error}</StatusMessage>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-wave-accent border-r-transparent border-b-transparent border-l-transparent" />
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Scanning frequencies...</p>
        </div>
      ) : null}

      {!isLoading && !error && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {stations.map((station, idx) => {
            const gradient = PRESET_GRADIENTS[idx % PRESET_GRADIENTS.length];
            const isCurrentStationPlaying = 
              isPlaying && 
              currentTrack && 
              currentTrack.genre?.trim().toLowerCase() === station.name.toLowerCase();

            return (
              <div
                key={station.name}
                className={`relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br ${gradient} border border-white/10 group shadow-2xl hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.98] transition-all duration-300`}
              >
                {/* Decorative vinyl background shape */}
                <div className="absolute -right-10 -bottom-10 h-36 w-36 rounded-full bg-black/10 border-8 border-black/5 flex items-center justify-center opacity-40 group-hover:scale-110 group-hover:rotate-45 transition-transform duration-500 pointer-events-none">
                  <Disc size={64} className={isCurrentStationPlaying ? "animate-spin-slow" : ""} />
                </div>

                <div className="relative z-10 flex flex-col justify-between h-full min-h-[120px]">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/50 bg-black/20 px-2 py-1 rounded-md">
                      Live Radio
                    </span>
                    <h3 className="mt-4 text-2xl font-black text-white tracking-tight leading-none capitalize">
                      {station.name} Radio
                    </h3>
                    <span className="block mt-2 text-[11px] font-bold text-white/70">
                      {station.tracks.length} {station.tracks.length === 1 ? "Track Freq" : "Tracks Freq"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleStartRadio(station.tracks)}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-transform shadow-lg"
                      title={`Tune in to ${station.name} mix`}
                    >
                      <Play size={16} fill="currentColor" className="ml-0.5" />
                    </button>
                    {isCurrentStationPlaying && (
                      <div className="flex items-end gap-[2px] h-3">
                        <span className="w-[2px] bg-white rounded-full animate-eq-1 h-2" />
                        <span className="w-[2px] bg-white rounded-full animate-eq-2 h-3" />
                        <span className="w-[2px] bg-white rounded-full animate-eq-3 h-1.5" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
