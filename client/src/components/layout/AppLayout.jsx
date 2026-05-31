import {
  Home,
  Music,
  UploadCloud,
  LogIn,
  LogOut,
  User,
  Compass,
  TrendingUp,
  Heart,
  Radio,
  Library
} from "lucide-react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { BottomPlayer } from "../player/BottomPlayer";
import { FriendActivity } from "../social/FriendActivity";
import { FloatingMusicOrb } from "../player/FloatingMusicOrb";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";

const navItems = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/search", label: "Discover", icon: Compass },
  { to: "/?section=trending", label: "Trending", icon: TrendingUp },
  { to: "/library?tab=favorites", label: "Favorites", icon: Heart },
  { to: "/library", label: "Library", icon: Music },
  { to: "/radio", label: "Radio", icon: Radio },
  { to: "/upload", label: "Upload", icon: UploadCloud },
];

const mobileNavItems = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/search", label: "Discover", icon: Compass },
  { to: "/library", label: "Library", icon: Music },
  { to: "/profile", label: "Profile", icon: User },
];

export function AppLayout() {
  const { isAuthenticated, logout, user } = useAuth();
  const { dynamicColor } = useAudioPlayer();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const r = dynamicColor?.r ?? 29;
  const g = dynamicColor?.g ?? 185;
  const b = dynamicColor?.b ?? 84;

  const isItemActive = (item) => {
    // Treat relative URLs correctly by resolving them relative to window.location.origin
    const url = new URL(item.to, window.location.origin);
    
    // Check if pathname matches
    if (location.pathname !== url.pathname) {
      return false;
    }
    
    const currentSearchParams = new URLSearchParams(location.search);
    const itemSearchParams = url.searchParams;
    
    // Exact section query parameter checks
    if (item.to === "/" || item.to === "/?section=trending") {
      const isTrending = currentSearchParams.get("section") === "trending";
      return item.to === "/" ? !isTrending : isTrending;
    }
    
    // Special handling for Library / Library Favorites
    if (item.to === "/library" && currentSearchParams.has("tab")) {
      return false;
    }
    
    // Generic check for other custom parameters
    for (const [key, value] of itemSearchParams.entries()) {
      if (currentSearchParams.get(key) !== value) {
        return false;
      }
    }
    
    return true;
  };

  return (
    <div className="min-h-screen bg-[#020203] text-white">

      {/* ── Global Ambient Glow Overlay ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 0%, rgba(${r},${g},${b},0.09) 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 80% 100%, rgba(${r},${g},${b},0.05) 0%, transparent 70%)
          `,
          transition: "background 1.4s cubic-bezier(0.25, 1, 0.5, 1)",
        }}
      />

      {/* ── Mobile Top Header ── */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-black/60 px-5 py-4 backdrop-blur-lg md:hidden">
        <NavLink
          to="/"
          className="flex items-center gap-2 font-black text-xl tracking-wider bg-gradient-to-r from-wave-accent to-emerald-400 bg-clip-text text-transparent"
        >
          WAVE
        </NavLink>
        {isAuthenticated ? (
          <NavLink
            to="/profile"
            className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-wave-accent to-emerald-500 text-sm font-bold text-black shadow-lg shadow-wave-accent/20 hover:scale-105 transition-transform"
            aria-label="Profile"
          >
            {user?.name?.charAt(0).toUpperCase()}
          </NavLink>
        ) : (
          <NavLink
            to="/login"
            className="grid h-9 w-9 place-items-center rounded-full bg-white text-black hover:scale-105 transition-transform"
            aria-label="Login"
          >
            <LogIn size={16} />
          </NavLink>
        )}
      </header>

      {/* ── Desktop Sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 glass-panel border-r border-white/[0.05] px-5 py-8 md:flex md:flex-col">
        {/* Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-2 font-black text-3xl tracking-widest bg-gradient-to-r from-wave-accent via-emerald-400 to-blue-500 bg-clip-text text-transparent hover:scale-[1.02] transition-transform select-none"
        >
          WAVE
        </NavLink>

        {/* Nav Items */}
        <nav className="mt-10 flex-1 space-y-1 stagger-children">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={
                  `group relative flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 overflow-hidden animate-slide-in-left ${
                    active
                      ? "text-white"
                      : "text-zinc-400 hover:text-white"
                  }`
                }
              >
                {/* Active glow backplate */}
                {active && (
                  <span
                    className="absolute inset-0 rounded-xl sidebar-indicator"
                    style={{
                      background: `linear-gradient(90deg, rgba(${r},${g},${b},0.18) 0%, transparent 100%)`,
                      borderLeft: `3px solid rgba(${r},${g},${b},0.9)`,
                      boxShadow: `inset 10px 0 20px -10px rgba(${r},${g},${b},0.3)`,
                    }}
                  />
                )}

                {/* Hover backplate (when not active) */}
                {!active && (
                  <span className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/[0.03] transition-colors duration-300" />
                )}

                <Icon
                  size={18}
                  className={`relative z-10 transition-all duration-300 group-hover:scale-110 ${
                    active
                      ? "drop-shadow-[0_0_6px_rgba(var(--dynamic-color-r),var(--dynamic-color-g),var(--dynamic-color-b),0.8)]"
                      : "text-zinc-400 group-hover:text-white"
                  }`}
                  style={active ? { color: `rgb(${r},${g},${b})` } : {}}
                />
                <span className="relative z-10 tracking-wide">{item.label}</span>

                {/* Hover arrow indicator */}
                {!active && (
                  <span className="absolute right-4 opacity-0 group-hover:opacity-30 transition-opacity text-zinc-400 text-xs">›</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div className="mt-auto pt-6 border-t border-white/[0.06]">
          {isAuthenticated ? (
            <div className="space-y-1">
              <NavLink
                to="/profile"
                className="flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-300 hover:bg-white/[0.04] hover:text-white transition-all duration-200 group"
              >
                <div
                  className="grid h-8 w-8 place-items-center rounded-full text-xs font-black text-black shadow-lg shrink-0 transition-transform group-hover:scale-105"
                  style={{ background: `linear-gradient(135deg, rgb(${r},${g},${b}), rgb(${Math.min(r+40,255)},${Math.min(g+20,255)},${Math.min(b+60,255)}))` }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="truncate">{user?.name}</span>
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-500 hover:bg-red-500/[0.08] hover:text-red-400 transition-all duration-200"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="block w-full rounded-full py-3 text-center text-sm font-bold text-black hover:opacity-90 active:scale-95 transition-all shadow-lg"
              style={{ background: `linear-gradient(135deg, rgb(${r},${g},${b}), rgb(${Math.min(r+30,255)},${Math.min(g+40,255)},${Math.min(b+80,255)}))` }}
            >
              Login
            </NavLink>
          )}
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main
        key={location.pathname + location.search}
        className="relative z-10 pb-36 md:pl-64 xl:pr-72 animate-fade-in"
      >
        <Outlet />
      </main>

      <FriendActivity />

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="fixed bottom-24 inset-x-4 z-20 grid grid-cols-4 rounded-2xl glass-panel border border-white/10 shadow-2xl md:hidden py-1 px-2">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={
                `flex flex-col items-center gap-1 py-2 rounded-xl text-center transition-all duration-200 ${
                  active ? "text-wave-accent bg-white/5" : "text-zinc-500 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              <span className="text-[10px] font-bold tracking-wider">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <BottomPlayer />
      <FloatingMusicOrb />
    </div>
  );
}
