import { useEffect, useState } from "react";
import { Users, RefreshCw, ChevronRight, ChevronLeft, Music } from "lucide-react";
import { api } from "../../api/axios";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { useAuth } from "../../hooks/useAuth";

export function FriendActivity() {
  const { isAuthenticated } = useAuth();
  const { playTrack } = useAudioPlayer();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  async function fetchFriendActivity() {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const { data } = await api.get("/social/friend-activity");
      setActivities(data.activity || []);
    } catch (e) {
      console.warn("Failed to load friend activity:", e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchFriendActivity();
    // Poll for friend activity updates every 15 seconds
    const interval = setInterval(fetchFriendActivity, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <aside 
      className={`fixed inset-y-0 right-0 z-10 hidden xl:flex flex-col border-l border-white/5 bg-black/35 backdrop-blur-xl transition-all duration-300 ${
        isOpen ? "w-72 px-5 py-8" : "w-16 px-3 py-8 items-center"
      }`}
    >
      {/* Header and Toggle Control */}
      <div className={`flex items-center justify-between w-full mb-6 ${!isOpen ? "flex-col gap-4" : ""}`}>
        {isOpen ? (
          <div className="flex items-center gap-2">
            <Users size={16} className="text-wave-accent" />
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">
              Friend Activity
            </h3>
          </div>
        ) : (
          <button 
            onClick={() => setIsOpen(true)}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.03] border border-white/5 text-zinc-400 hover:text-white"
            aria-label="Expand sidebar"
          >
            <Users size={15} />
          </button>
        )}

        <div className="flex items-center gap-1.5">
          {isOpen && (
            <button
              onClick={fetchFriendActivity}
              disabled={isLoading}
              className={`p-1.5 rounded-full hover:bg-white/[0.04] text-zinc-500 hover:text-white transition-colors ${
                isLoading ? "animate-spin" : ""
              }`}
              title="Refresh feed"
            >
              <RefreshCw size={13} />
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-full hover:bg-white/[0.04] text-zinc-500 hover:text-white transition-colors"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>
      </div>

      {/* Activities List */}
      {isOpen ? (
        <div className="flex-1 overflow-y-auto space-y-5 scrollbar-none">
          {activities.length > 0 ? (
            activities.map((act) => (
              <div 
                key={act._id} 
                className="group flex gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all duration-200"
              >
                {/* User Avatar & Status Indicator */}
                <div className="relative h-10 w-10 shrink-0">
                  <div className="grid h-full w-full place-items-center rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-950 border border-white/10 text-sm font-black text-white shadow-inner">
                    {act.user.name?.charAt(0).toUpperCase()}
                  </div>
                  {/* Glowing active green dot */}
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-950 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                </div>

                {/* Friend text info */}
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-black text-white hover:text-wave-accent transition-colors truncate">
                    {act.user.name}
                  </span>
                  
                  {act.song ? (
                    <div className="mt-1">
                      <button 
                        onClick={() => playTrack(act.song, [act.song])}
                        className="flex items-center gap-1 text-[11px] font-bold text-zinc-300 hover:text-wave-accent transition-colors truncate text-left w-full group/play"
                      >
                        <Music size={10} className="shrink-0 text-zinc-500 group-hover/play:text-wave-accent" />
                        <span className="truncate">{act.song.title}</span>
                      </button>
                      <span className="block text-[10px] font-semibold text-zinc-500 truncate pl-3.5 mt-0.5">
                        {act.song.artist}
                      </span>
                    </div>
                  ) : (
                    <span className="block text-[10px] font-semibold text-zinc-500 mt-0.5 italic">
                      Idle
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">No active friends</p>
            </div>
          )}
        </div>
      ) : (
        /* Minimized state vertical strip */
        <div className="flex-1 overflow-y-auto space-y-4 scrollbar-none w-full flex flex-col items-center">
          {activities.map((act) => (
            <div 
              key={act._id} 
              className="relative h-10 w-10 shrink-0 cursor-pointer"
              title={`${act.user.name} - ${act.song ? `${act.song.title} by ${act.song.artist}` : "Idle"}`}
              onClick={() => act.song && playTrack(act.song, [act.song])}
            >
              <div className="grid h-full w-full place-items-center rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-950 border border-white/10 text-xs font-black text-zinc-400 hover:text-white transition-colors">
                {act.user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-zinc-950 bg-emerald-500 shadow-[0_0_6px_#10b981]" />
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
