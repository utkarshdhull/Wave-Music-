import { useEffect, useState } from "react";
import { updateUserAvatar, updateUserProfile } from "../api/userApi";
import { StatusMessage } from "../components/ui/StatusMessage";
import { useAuth } from "../hooks/useAuth";
import { resolveMediaUrl } from "../utils/media";
import { Camera, User as UserIcon, Mail, ShieldAlert, Clock, Music, Award, Disc } from "lucide-react";
import { api } from "../api/axios";
import { ActivityFeed } from "../components/social/ActivityFeed";

function formatListeningTime(seconds) {
  if (!seconds || seconds <= 0) return "0 min";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }
  return `${minutes} min`;
}

export function Profile() {
  const { setUser, user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Stats State
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  async function fetchStats() {
    try {
      const { data } = await api.get("/social/profile/stats");
      setStats(data.stats);
    } catch (e) {
      console.warn("Failed to load profile stats:", e);
    } finally {
      setIsLoadingStats(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setError("");
    setStatus("");
    setIsSaving(true);

    try {
      const updatedUser = await updateUserProfile({ name });
      setUser(updatedUser);
      setStatus("Profile updated successfully");
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Profile update failed");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAvatarChange(event) {
    const [file] = event.target.files;

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);
    setError("");
    setStatus("");

    try {
      const updatedUser = await updateUserAvatar(formData);
      setUser(updatedUser);
      setStatus("Avatar updated successfully");
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Avatar update failed");
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 md:py-10">
      <h2 className="text-3xl font-black tracking-tight">Music Profile</h2>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_2fr]">
        
        {/* Left Column: Account Settings & Avatar */}
        <div className="space-y-6">
          <div className="rounded-2xl glass-panel p-6 md:p-8 shadow-2xl border border-white/5 bg-white/[0.01]">
            {/* User Avatar Container */}
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <div className="relative group h-24 w-24 shrink-0 rounded-full overflow-hidden bg-gradient-to-tr from-wave-accent to-emerald-500 shadow-xl border-2 border-white/10">
                {user?.avatarUrl ? (
                  <img className="h-full w-full object-cover" src={resolveMediaUrl(user.avatarUrl)} alt="" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-black text-black select-none">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Camera Hover Upload */}
                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-300">
                  <Camera size={18} className="text-white" />
                  <span className="text-[8px] font-bold uppercase tracking-wider text-white mt-1">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="text-center sm:text-left min-w-0">
                <h3 className="text-xl font-bold text-white tracking-wide truncate">{user?.name}</h3>
                <p className="flex items-center justify-center sm:justify-start gap-1.5 text-sm font-semibold text-zinc-400 mt-1 truncate">
                  <Mail size={14} className="text-zinc-500" />
                  {user?.email}
                </p>
                <span className="mt-2.5 inline-flex items-center gap-1 rounded-md bg-wave-accent/10 border border-wave-accent/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-wave-accent">
                  Account: {user?.role || "User"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <StatusMessage variant="success">{status}</StatusMessage>
              <StatusMessage variant="error">{error}</StatusMessage>
            </div>

            {/* Profile Update Form */}
            <form onSubmit={handleProfileSubmit} className="mt-6 border-t border-white/5 pt-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400" htmlFor="profile-name">
                Display Name
              </label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500">
                  <UserIcon size={16} />
                </div>
                <input
                  id="profile-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="w-full rounded-xl border border-white/5 bg-black/40 pl-10 pr-3.5 py-3 text-sm text-white outline-none focus:border-wave-accent/40 focus:bg-black/60 transition-all font-semibold"
                  placeholder="Enter your name"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSaving}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-zinc-200 active:scale-95 transition-all shadow-md"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </form>
            
            {/* Security Note */}
            <div className="mt-6 flex gap-3 rounded-xl bg-white/[0.01] border border-white/5 p-4">
              <ShieldAlert size={18} className="text-zinc-500 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <h4 className="font-bold text-zinc-300">Security Settings</h4>
                <p className="text-zinc-500 mt-1 font-semibold">
                  Profile changes update instantly. To change account passwords, contact your administrator.
                </p>
              </div>
            </div>
          </div>

          {/* Social Activity Feed Widget */}
          <ActivityFeed />
        </div>

        {/* Right Column: Music Streaming Stats */}
        <div className="space-y-6">
          
          {/* Main Highlights Stats Counters */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl glass-panel p-5 border border-white/5 bg-white/[0.01] text-center">
              <Clock size={20} className="text-wave-accent mx-auto mb-2" />
              <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Listening Time</span>
              <span className="block mt-1.5 text-lg font-black text-white">
                {isLoadingStats ? "..." : formatListeningTime(stats?.totalTime)}
              </span>
            </div>
            <div className="rounded-2xl glass-panel p-5 border border-white/5 bg-white/[0.01] text-center">
              <Music size={20} className="text-blue-400 mx-auto mb-2" />
              <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">My Playlists</span>
              <span className="block mt-1.5 text-lg font-black text-white">
                {isLoadingStats ? "..." : stats?.playlistCount || 0}
              </span>
            </div>
            <div className="rounded-2xl glass-panel p-5 border border-white/5 bg-white/[0.01] text-center">
              <Award size={20} className="text-violet-400 mx-auto mb-2" />
              <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Top Artist</span>
              <span className="block mt-1.5 text-xs font-black text-white truncate max-w-full">
                {isLoadingStats ? "..." : stats?.topArtists?.[0]?.name || "N/A"}
              </span>
            </div>
          </div>

          {/* Detailed metrics cards */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Top Genres Progress lists */}
            <div className="rounded-2xl glass-panel p-6 border border-white/5 bg-white/[0.01]">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-5">
                Top Genres
              </h3>
              {isLoadingStats ? (
                <div className="py-6 flex justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border border-t-wave-accent border-r-transparent border-b-transparent border-l-transparent" />
                </div>
              ) : stats?.topGenres?.length > 0 ? (
                <div className="space-y-4">
                  {stats.topGenres.map((genre, idx) => {
                    const maxVal = stats.topGenres[0]?.count || 1;
                    const percentage = Math.round((genre.count / maxVal) * 100);
                    return (
                      <div key={genre.name}>
                        <div className="flex justify-between text-xs font-bold text-zinc-300 mb-1">
                          <span className="capitalize">{genre.name}</span>
                          <span className="text-zinc-500">{genre.count} plays</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-wave-accent shadow-[0_0_6px_rgba(29,185,84,0.3)] rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 font-semibold italic text-center py-6">Not enough data to calculate stats</p>
              )}
            </div>

            {/* Top Artists progress list */}
            <div className="rounded-2xl glass-panel p-6 border border-white/5 bg-white/[0.01]">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-5">
                Top Artists
              </h3>
              {isLoadingStats ? (
                <div className="py-6 flex justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border border-t-wave-accent border-r-transparent border-b-transparent border-l-transparent" />
                </div>
              ) : stats?.topArtists?.length > 0 ? (
                <div className="space-y-4">
                  {stats.topArtists.map((artist) => {
                    const maxVal = stats.topArtists[0]?.count || 1;
                    const percentage = Math.round((artist.count / maxVal) * 100);
                    return (
                      <div key={artist.name}>
                        <div className="flex justify-between text-xs font-bold text-zinc-300 mb-1">
                          <span>{artist.name}</span>
                          <span className="text-zinc-500">{artist.count} plays</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_6px_rgba(59,130,246,0.3)] rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 font-semibold italic text-center py-6">Not enough data to calculate stats</p>
              )}
            </div>

          </div>

          {/* Most Played Songs list */}
          <div className="rounded-2xl glass-panel p-6 border border-white/5 bg-white/[0.01]">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-5">
              Most Played Songs
            </h3>
            {isLoadingStats ? (
              <div className="py-10 flex justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border border-t-wave-accent border-r-transparent border-b-transparent border-l-transparent" />
              </div>
            ) : stats?.mostPlayed?.length > 0 ? (
              <div className="space-y-3.5">
                {stats.mostPlayed.map((item, idx) => (
                  <div key={item.song.id} className="flex items-center justify-between text-xs py-1.5 border-b border-white/[0.02] last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="text-zinc-500 font-black tracking-wider text-center w-4">0{idx + 1}</span>
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md bg-zinc-800 border border-white/5">
                        {item.song.coverUrl ? (
                          <img className="h-full w-full object-cover" src={resolveMediaUrl(item.song.coverUrl)} alt="" />
                        ) : (
                          <div className="grid h-full w-full place-items-center bg-zinc-950 font-extrabold text-zinc-600">
                            <Disc size={16} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="block text-white font-bold truncate">{item.song.title}</span>
                        <span className="block text-[10px] font-semibold text-zinc-500 mt-0.5 truncate">{item.song.artist}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 shrink-0 bg-white/[0.03] px-2.5 py-1 rounded-md border border-white/5">
                      {item.playCount} plays
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 font-semibold italic text-center py-10">No listening history recorded yet</p>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
