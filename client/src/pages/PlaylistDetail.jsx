import { Plus, Trash2, ArrowLeft, Disc, Share2, Users, UserMinus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { addPlaylistSong, getPlaylist, removePlaylistSong } from "../api/playlistApi";
import { listSongs } from "../api/songApi";
import { SongList } from "../components/song/SongList";
import { StatusMessage } from "../components/ui/StatusMessage";
import { useFavorites } from "../hooks/useFavorites";
import { useAuth } from "../hooks/useAuth";
import { resolveMediaUrl } from "../utils/media";
import { api } from "../api/axios";

export function PlaylistDetail() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Collaborator state management
  const [inviteEmail, setInviteEmail] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const [collabError, setCollabError] = useState("");

  const playlistSongIds = useMemo(
    () => new Set((playlist?.songs ?? []).map((song) => song.id ?? song)),
    [playlist]
  );

  const availableSongs = useMemo(
    () => songs.filter((song) => !playlistSongIds.has(song.id)),
    [playlistSongIds, songs]
  );

  // Authorization checks
  const isOwner = useMemo(
    () => playlist && isAuthenticated && String(playlist.owner) === String(user?._id),
    [playlist, isAuthenticated, user]
  );

  const isCollaborator = useMemo(
    () => playlist && isAuthenticated && playlist.collaborators?.some(c => String(c.id || c) === String(user?._id)),
    [playlist, isAuthenticated, user]
  );

  const canEdit = isOwner || isCollaborator;

  useEffect(() => {
    let isMounted = true;

    async function loadPlaylist() {
      try {
        const [playlistData, songData] = await Promise.all([getPlaylist(id), listSongs({ limit: 100 })]);

        if (isMounted) {
          setPlaylist(playlistData);
          setSongs(songData.songs);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.message ?? "Playlist unavailable");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPlaylist();

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleAddSong(song) {
    setError("");

    try {
      const updatedPlaylist = await addPlaylistSong(id, song.id);
      setPlaylist(updatedPlaylist);
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Song could not be added");
    }
  }

  async function handleRemoveSong(song) {
    setError("");

    try {
      const updatedPlaylist = await removePlaylistSong(id, song.id);
      setPlaylist(updatedPlaylist);
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Song could not be removed");
    }
  }

  // Invite/Remove collaborators handlers
  async function handleAddCollaborator(e) {
    e.preventDefault();
    setCollabError("");
    try {
      const { data } = await api.post(`/playlists/${id}/collaborators`, { email: inviteEmail });
      setPlaylist(data.playlist);
      setInviteEmail("");
    } catch (err) {
      setCollabError(err.response?.data?.message ?? "Failed to invite collaborator");
    }
  }

  async function handleRemoveCollaborator(userId) {
    setCollabError("");
    try {
      const { data } = await api.delete(`/playlists/${id}/collaborators/${userId}`);
      setPlaylist(data.playlist);
    } catch (err) {
      setCollabError(err.response?.data?.message ?? "Failed to remove collaborator");
    }
  }

  function handleSharePlaylist() {
    const shareUrl = window.location.origin + "/playlists/" + id;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setShareStatus("Copied link!");
        setTimeout(() => setShareStatus(""), 3000);
      })
      .catch(() => {
        setShareStatus("Failed to copy");
      });
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 md:py-10">
      {/* Back to Library navigation link (only if authenticated) */}
      {isAuthenticated && (
        <Link to="/library" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors">
          <ArrowLeft size={14} />
          Back to Library
        </Link>
      )}
      
      {/* Playlist Hero Info Section */}
      <div className="relative mt-6 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent p-6 md:p-8 shadow-2xl backdrop-blur-md">
        {/* Glow backdrop */}
        <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-wave-accent/10 blur-3xl" />
        
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end">
          {/* Playlist Image fallback / cover */}
          <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl bg-zinc-800 shadow-2xl border border-white/10 group">
            {playlist?.coverUrl || playlist?.songs?.[0]?.coverUrl ? (
              <img
                src={resolveMediaUrl(playlist?.coverUrl || playlist?.songs?.[0]?.coverUrl)}
                alt="Playlist cover"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600/30 to-zinc-900 text-wave-accent">
                <Disc size={56} className="animate-spin-slow" />
              </div>
            )}
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-wave-accent bg-wave-accent/10 px-2.5 py-1 rounded-full border border-wave-accent/10 inline-block">
              {playlist?.collaborators?.length > 0 ? "Collaborative Playlist" : "Playlist"}
            </span>
            <h2 className="mt-3 text-3xl font-black md:text-5xl lg:text-6xl tracking-tight text-white leading-none truncate">
              {playlist?.name ?? "Loading Playlist..."}
            </h2>
            
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold text-zinc-400">
              <span className="text-white font-bold">
                {playlist?.songs?.length ?? 0} {playlist?.songs?.length === 1 ? "song" : "songs"}
              </span>
              <span className="h-1 w-1 rounded-full bg-zinc-600" />
              <span>Created by Wave User</span>
              {playlist?.isPublic !== undefined && (
                <>
                  <span className="h-1 w-1 rounded-full bg-zinc-600" />
                  <span className="capitalize">{playlist.isPublic ? "Public" : "Private"}</span>
                </>
              )}
            </div>

            {playlist?.description && (
              <p className="mt-3.5 text-xs md:text-sm font-semibold text-zinc-400 max-w-2xl leading-relaxed">
                {playlist.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-16 flex flex-col items-center justify-center gap-3 py-10">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-t-wave-accent border-r-transparent border-b-transparent border-l-transparent" />
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Loading tracks...</p>
        </div>
      ) : null}

      <StatusMessage variant="error">{error}</StatusMessage>

      {playlist && !isLoading ? (
        <div className="mt-10 space-y-10">
          
          {/* Share & Collaborator Form Panel */}
          {isAuthenticated && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Share card */}
              <div className="rounded-2xl glass-panel p-5 border border-white/5 bg-white/[0.01]">
                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2.5 flex items-center gap-1.5">
                  <Share2 size={14} className="text-wave-accent" />
                  Share Playlist
                </h4>
                <p className="text-xs font-semibold text-zinc-500 mb-4 leading-relaxed">
                  Generate a share link so that guests can access and stream this playlist's collection.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSharePlaylist}
                    className="rounded-full bg-white text-black hover:bg-zinc-200 active:scale-95 px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-200"
                  >
                    Copy Share Link
                  </button>
                  {shareStatus && (
                    <span className="text-xs font-extrabold text-wave-accent animate-pulse">
                      {shareStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Collaborator management card */}
              <div className="rounded-2xl glass-panel p-5 border border-white/5 bg-white/[0.01] flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5">
                    <Users size={14} className="text-wave-accent" />
                    Contributors ({playlist.collaborators?.length || 0})
                  </h4>
                  
                  <div className="flex flex-wrap gap-2.5 mb-4">
                    {/* Creator placeholder badge */}
                    <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/5 pl-2.5 pr-3 py-1 rounded-full text-xs font-semibold">
                      <span className="h-2 w-2 rounded-full bg-wave-accent shadow-[0_0_6px_#10b981]" />
                      <span className="text-zinc-300">Creator</span>
                    </div>

                    {playlist.collaborators?.map((collab) => (
                      <div key={collab.id} className="flex items-center gap-1.5 bg-white/[0.03] border border-white/5 pl-3 pr-2 py-1 rounded-full text-xs font-semibold">
                        <span className="text-zinc-300 truncate max-w-[120px]">{collab.name}</span>
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCollaborator(collab.id)}
                            className="text-zinc-500 hover:text-red-400 p-0.5 rounded-full hover:bg-white/5"
                            title="Remove contributor"
                          >
                            <UserMinus size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {isOwner && (
                  <form onSubmit={handleAddCollaborator} className="border-t border-white/5 pt-4 mt-2">
                    <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block mb-2">
                      Invite collaborator by email
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="partner@example.com"
                        className="rounded-xl border border-white/5 bg-black/40 px-3.5 py-2 text-xs text-white outline-none focus:border-wave-accent/40 focus:bg-black/60 transition-all font-semibold flex-1"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-wave-accent text-black hover:bg-emerald-400 active:scale-95 px-5 py-2 text-xs font-black uppercase tracking-wider transition-all duration-200"
                      >
                        Invite
                      </button>
                    </div>
                    {collabError && (
                      <span className="text-[10px] font-bold text-red-400 block mt-2">
                        {collabError}
                      </span>
                    )}
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Songs List */}
          <div>
            <div className="border-b border-white/5 pb-2">
              <h3 className="text-base font-extrabold tracking-tight text-white">
                Playlist Songs
              </h3>
            </div>
            <SongList
              emptyMessage="No songs in this playlist yet. Add some to get started!"
              songs={playlist.songs ?? []}
              favoriteIds={favoriteIds}
              onToggleFavorite={isAuthenticated ? toggleFavorite : null}
              renderAction={canEdit ? (song) => (
                <button
                  type="button"
                  onClick={() => handleRemoveSong(song)}
                  className="grid h-8 w-8 place-items-center rounded-full text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  aria-label="Remove from playlist"
                >
                  <Trash2 size={14} />
                </button>
              ) : null}
            />
          </div>

          {/* Add Songs Section */}
          {canEdit && (
            <div className="pt-6 border-t border-white/5">
              <div className="border-b border-white/5 pb-2">
                <h3 className="text-base font-extrabold tracking-tight text-zinc-400">
                  Recommended Additions
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">Quickly expand your playlist with songs from the Wave catalog.</p>
              </div>
              
              <SongList
                emptyMessage="All library songs are already added to this playlist."
                songs={availableSongs}
                favoriteIds={favoriteIds}
                onToggleFavorite={isAuthenticated ? toggleFavorite : null}
                renderAction={(song) => (
                  <button
                    type="button"
                    onClick={() => handleAddSong(song)}
                    className="grid h-8 w-8 place-items-center rounded-full text-zinc-500 hover:bg-wave-accent/15 hover:text-wave-accent transition-colors"
                    aria-label="Add to playlist"
                  >
                    <Plus size={16} />
                  </button>
                )}
              />
            </div>
          )}

        </div>
      ) : null}
    </section>
  );
}
