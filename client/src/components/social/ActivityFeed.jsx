import { useEffect, useState } from "react";
import { ListMusic, Heart, PlusCircle, UserPlus, Flame, RefreshCw } from "lucide-react";
import { api } from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";

function timeSince(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 5) return "just now";
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
}

export function ActivityFeed() {
  const { isAuthenticated } = useAuth();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchFeed() {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const { data } = await api.get("/social/feed");
      setActivities(data.activities || []);
    } catch (e) {
      console.warn("Failed to load activity feed:", e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchFeed();
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  function renderIcon(type) {
    switch (type) {
      case "CREATE_PLAYLIST":
        return <ListMusic size={14} className="text-blue-400" />;
      case "LIKE_SONG":
        return <Heart size={14} className="text-red-400" fill="currentColor" />;
      case "UPLOAD_SONG":
        return <PlusCircle size={14} className="text-emerald-400" />;
      case "ADD_COLLABORATOR":
        return <UserPlus size={14} className="text-violet-400" />;
      default:
        return <Flame size={14} className="text-wave-accent" />;
    }
  }

  function formatActivityText(act) {
    const name = <span className="text-white font-extrabold">{act.user?.name || "Someone"}</span>;
    const target = <span className="text-wave-accent font-bold">"{act.targetName}"</span>;

    switch (act.type) {
      case "CREATE_PLAYLIST":
        return <>{name} created playlist {target}</>;
      case "LIKE_SONG":
        return <>{name} favorited track {target}</>;
      case "UPLOAD_SONG":
        return <>{name} uploaded a new track {target}</>;
      case "ADD_COLLABORATOR":
        return <>{name} added a contributor to playlist {target}</>;
      default:
        return <>{name} performed action on {target}</>;
    }
  }

  return (
    <div className="rounded-2xl glass-panel p-5 border border-white/5 bg-white/[0.01]">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-wave-accent" />
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">
            Recent Activities
          </h3>
        </div>
        <button
          onClick={fetchFeed}
          disabled={isLoading}
          className={`p-1.5 rounded-full hover:bg-white/[0.04] text-zinc-500 hover:text-white transition-colors ${
            isLoading ? "animate-spin" : ""
          }`}
          title="Refresh feed"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {isLoading && activities.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-wave-accent border-r-transparent border-b-transparent border-l-transparent" />
        </div>
      ) : activities.length > 0 ? (
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
          {activities.map((act) => (
            <div 
              key={act._id} 
              className="flex items-start gap-3.5 text-xs text-zinc-400 py-1 border-b border-white/[0.02] last:border-0 pb-3 last:pb-0"
            >
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.03] border border-white/5 shadow-inner">
                {renderIcon(act.type)}
              </div>
              <div className="flex-1 min-w-0 leading-relaxed">
                <p className="truncate-2-lines">{formatActivityText(act)}</p>
                <span className="text-[10px] font-semibold text-zinc-500 block mt-1 uppercase tracking-wider">
                  {timeSince(act.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-white/5 rounded-xl bg-white/[0.005]">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">No activities logged yet</p>
        </div>
      )}
    </div>
  );
}
