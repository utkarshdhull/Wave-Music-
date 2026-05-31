import { Search as SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { searchSongs } from "../api/songApi";
import { SongCard } from "../components/song/SongCard";
import { StatusMessage } from "../components/ui/StatusMessage";
import { useAuth } from "../hooks/useAuth";
import { useFavorites } from "../hooks/useFavorites";

export function Search() {
  const { isAuthenticated } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();

    if (q.length < 2) {
      setSongs([]);
      setError("");
      setIsLoading(false);
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await searchSongs({ q, limit: 30 });
        setSongs(data.songs);
      } catch (requestError) {
        setError(requestError.response?.data?.message ?? "Search unavailable");
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 md:py-10">
      <h2 className="text-3xl font-black tracking-tight">Search</h2>
      
      {/* Search Bar Input */}
      <div className="mt-6 flex max-w-2xl items-center gap-3.5 rounded-2xl glass-panel px-4 py-3.5 border border-white/5 bg-white/[0.02] text-white focus-within:border-wave-accent/40 focus-within:bg-white/[0.04] transition-all duration-300 shadow-lg shadow-black/10">
        <SearchIcon size={20} className="text-zinc-400 group-focus-within:text-wave-accent" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full bg-transparent text-sm font-semibold tracking-wide outline-none placeholder-zinc-500"
          placeholder="What do you want to play? (Songs, artists, genres)"
        />
      </div>

      {/* Loading & Status States */}
      {isLoading ? (
        <div className="mt-12 flex flex-col items-center justify-center gap-3 py-16">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-t-wave-accent border-r-transparent border-b-transparent border-l-transparent" />
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Searching catalogue...</p>
        </div>
      ) : null}
      
      <StatusMessage variant="error">{error}</StatusMessage>

      {/* Search Results Display */}
      {!isLoading && !error && query.trim().length >= 2 ? (
        <div className="mt-10">
          <div className="border-b border-white/5 pb-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">
              Matches found ({songs.length})
            </h3>
          </div>
          {songs.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {songs.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  songs={songs}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={isAuthenticated ? toggleFavorite : null}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-white/5 bg-white/[0.01]">
              <p className="text-sm font-semibold text-zinc-400">No results match your query.</p>
              <p className="mt-1 text-xs text-zinc-500 font-medium">Try checking spelling or searching for another keyword.</p>
            </div>
          )}
        </div>
      ) : null}
      
      {/* Search Onboarding / Placeholder */}
      {query.trim().length < 2 && !isLoading && (
        <div className="mt-10 animate-fade-in">
          {/* Trending Searches */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-4">
              Trending Searches
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {["Kishore Kumar", "Diljit Dosanjh", "Raju Punjabi", "AP Dhillon", "Lata Mangeshkar", "Romantic"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setQuery(tag)}
                  className="rounded-full bg-white/[0.03] border border-white/5 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.08] hover:border-white/10 transition-all duration-200"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Browse Genres */}
          <div className="mt-12">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-6">
              Browse All
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {[
                { name: "Bollywood", gradient: "from-violet-600 to-pink-500", query: "Bollywood" },
                { name: "Punjabi", gradient: "from-amber-500 to-red-600", query: "Punjabi" },
                { name: "Haryanvi", gradient: "from-emerald-500 to-teal-700", query: "Haryanvi" },
                { name: "English Pop", gradient: "from-blue-600 to-indigo-700", query: "English" },
                { name: "Classical", gradient: "from-orange-400 to-amber-600", query: "Classical" },
                { name: "Chill & Lo-Fi", gradient: "from-rose-400 to-indigo-500", query: "Romantic" }
              ].map((genre) => (
                <button
                  key={genre.name}
                  type="button"
                  onClick={() => setQuery(genre.query)}
                  className={`relative overflow-hidden aspect-video sm:aspect-square w-full rounded-2xl p-5 text-left transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.98] shadow-lg hover:shadow-xl bg-gradient-to-br ${genre.gradient} border border-white/10 group`}
                >
                  {/* Decorative background circle */}
                  <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-white/10 blur-xl group-hover:scale-125 transition-transform duration-500" />
                  
                  <span className="text-lg font-black tracking-tight text-white block">
                    {genre.name}
                  </span>
                  <span className="absolute bottom-4 right-4 text-[10px] font-black uppercase tracking-widest text-white/60 bg-black/25 px-2 py-1 rounded-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Explore
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
