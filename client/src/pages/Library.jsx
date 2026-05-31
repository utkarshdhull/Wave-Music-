import { ListMusic, Plus, Trash2, Heart, History, FolderHeart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPlaylist, deletePlaylist, listPlaylists } from "../api/playlistApi";
import { getRecentlyPlayed } from "../api/songApi";
import { SongList } from "../components/song/SongList";
import { EmptyState } from "../components/ui/EmptyState";
import { StatusMessage } from "../components/ui/StatusMessage";
import { useFavorites } from "../hooks/useFavorites";

const tabs = [
  { id: "favorites", label: "Favorites", icon: Heart },
  { id: "recent", label: "Recent", icon: History },
  { id: "playlists", label: "Playlists", icon: ListMusic }
];

export function Library() {
  const { favoriteIds, favorites, isLoadingFavorites, toggleFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState("favorites");
  const [recentSongs, setRecentSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [playlistForm, setPlaylistForm] = useState({ description: "", isPublic: false, name: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadLibrary() {
      try {
        const [recent, playlistData] = await Promise.all([getRecentlyPlayed(), listPlaylists()]);

        if (isMounted) {
          setRecentSongs(recent);
          setPlaylists(playlistData);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.message ?? "Library unavailable");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadLibrary();

    return () => {
      isMounted = false;
    };
  }, []);

  function updatePlaylistForm(event) {
    const { checked, name, type, value } = event.target;

    setPlaylistForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  async function handleCreatePlaylist(event) {
    event.preventDefault();
    setError("");

    try {
      const playlist = await createPlaylist(playlistForm);
      setPlaylists((current) => [playlist, ...current]);
      setPlaylistForm({ description: "", isPublic: false, name: "" });
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Playlist creation failed");
    }
  }

  async function handleDeletePlaylist(playlistId) {
    setError("");

    try {
      await deletePlaylist(playlistId);
      setPlaylists((current) => current.filter((playlist) => playlist.id !== playlistId));
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Playlist deletion failed");
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 md:py-10">
      <h2 className="text-3xl font-black tracking-tight">Your Library</h2>

      {/* Tabs Selector Bar */}
      <div className="mt-6 flex max-w-md rounded-2xl glass-panel p-1 border border-white/5 bg-white/[0.01]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-white text-black shadow-lg"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <StatusMessage variant="error">{error}</StatusMessage>

      {/* Loading States */}
      {(isLoading || isLoadingFavorites) && (
        <div className="mt-12 flex flex-col items-center justify-center gap-3 py-16">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-t-wave-accent border-r-transparent border-b-transparent border-l-transparent" />
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Loading Library...</p>
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === "favorites" && !isLoadingFavorites ? (
        <div className="mt-6">
          <SongList
            emptyMessage="No favorites yet. Tap the heart icon on any song to add it here!"
            songs={favorites}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
          />
        </div>
      ) : null}

      {/* Recent Tab */}
      {activeTab === "recent" && !isLoading ? (
        <div className="mt-6">
          <SongList
            emptyMessage="No recently played songs yet. Start listening to track your history!"
            songs={recentSongs}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
          />
        </div>
      ) : null}

      {/* Playlists Tab */}
      {activeTab === "playlists" && !isLoading ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[340px_1fr]">
          
          {/* New Playlist Form Card */}
          <form onSubmit={handleCreatePlaylist} className="h-fit rounded-2xl glass-panel p-6 border border-white/5 shadow-xl bg-white/[0.01]">
            <h3 className="text-base font-extrabold text-white tracking-wide border-b border-white/5 pb-3">
              New Playlist
            </h3>
            
            <div className="mt-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400" htmlFor="playlist-name">
                Name
              </label>
              <input
                id="playlist-name"
                name="name"
                value={playlistForm.name}
                onChange={updatePlaylistForm}
                required
                className="mt-2 w-full rounded-xl border border-white/5 bg-black/40 px-3.5 py-3 text-sm text-white outline-none focus:border-wave-accent/40 focus:bg-black/60 transition-all"
                placeholder="My awesome playlist"
              />
            </div>
            
            <div className="mt-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400" htmlFor="playlist-description">
                Description
              </label>
              <textarea
                id="playlist-description"
                name="description"
                value={playlistForm.description}
                onChange={updatePlaylistForm}
                rows="3"
                className="mt-2 w-full resize-none rounded-xl border border-white/5 bg-black/40 px-3.5 py-3 text-sm text-white outline-none focus:border-wave-accent/40 focus:bg-black/60 transition-all"
                placeholder="Give it a brief description..."
              />
            </div>
            
            <div className="mt-4 flex items-center gap-3">
              <input
                id="playlist-isPublic"
                name="isPublic"
                type="checkbox"
                checked={playlistForm.isPublic}
                onChange={updatePlaylistForm}
                className="h-4.5 w-4.5 rounded border-white/10 bg-black text-wave-accent accent-wave-accent focus:ring-0 focus:ring-offset-0"
              />
              <label htmlFor="playlist-isPublic" className="text-xs font-semibold text-zinc-300 select-none cursor-pointer">
                Make playlist public
              </label>
            </div>
            
            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-wave-accent py-3 text-xs font-black uppercase tracking-wider text-black hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-wave-accent/15"
            >
              <Plus size={16} strokeWidth={3} />
              Create Playlist
            </button>
          </form>

          {/* Playlists Grid */}
          <div className="space-y-4">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">
                Your Playlists ({playlists.length})
              </h3>
            </div>
            
            {playlists.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {playlists.map((playlist) => (
                  <div 
                    key={playlist.id} 
                    className="group relative flex flex-col justify-between rounded-xl glass-panel p-4 border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 shadow-lg"
                  >
                    <Link to={`/playlists/${playlist.id}`} className="block">
                      {/* Playlist Artwork fallback with cool gradient */}
                      <div className="grid h-32 w-full place-items-center rounded-lg bg-gradient-to-tr from-zinc-800 via-neutral-900 to-zinc-900 shadow border border-white/5 group-hover:scale-[1.02] transition-transform duration-300">
                        <ListMusic size={36} className="text-zinc-500 group-hover:text-wave-accent transition-colors" />
                      </div>
                      <h4 className="mt-4 truncate font-bold text-white tracking-wide group-hover:text-wave-accent transition-colors">
                        {playlist.name}
                      </h4>
                      <p className="mt-1 line-clamp-2 min-h-8 text-xs font-semibold text-zinc-400 leading-normal">
                        {playlist.description || "No description provided."}
                      </p>
                    </Link>
                    
                    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3.5">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        {playlist.isPublic ? "Public" : "Private"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeletePlaylist(playlist.id)}
                        className="grid h-8 w-8 place-items-center rounded-full text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        aria-label="Delete playlist"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-white/5 bg-white/[0.01]">
                <FolderHeart size={36} className="text-zinc-600 animate-float" />
                <h4 className="mt-4 text-sm font-bold text-white tracking-wide">No playlists yet</h4>
                <p className="mt-1 max-w-xs text-center text-xs font-semibold text-zinc-500 leading-normal">
                  Create a playlist using the sidebar form to start grouping your favorite tracks.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
