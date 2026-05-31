import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { UserPlus, User, Key, Mail, Disc } from "lucide-react";

export function Register() {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="relative grid min-h-screen place-items-center bg-[#020203] px-4 py-12 text-white overflow-hidden">
      {/* Background ambient glowing blobs */}
      <div className="absolute top-1/4 left-1/3 h-80 w-80 rounded-full bg-wave-accent/10 blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/3 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl animate-float" />

      <form 
        onSubmit={handleSubmit} 
        className="relative z-10 w-full max-w-md rounded-2xl glass-panel p-8 shadow-2xl border border-white/5 bg-[#121218]/65 shadow-black/80"
      >
        <div className="flex flex-col items-center">
          <NavLinkToLogo />
          <h2 className="mt-6 text-2xl font-black text-white tracking-wide">Create Account</h2>
          <p className="text-xs font-semibold text-zinc-400 mt-1">Get started with a free Wave account</p>
        </div>

        {error ? (
          <p className="mt-5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs font-bold text-red-300 leading-normal">
            {error}
          </p>
        ) : null}

        {/* Name Field */}
        <div className="mt-6">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400" htmlFor="name">
            Display Name
          </label>
          <div className="relative mt-2">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500">
              <User size={16} />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={updateField}
              required
              className="w-full rounded-xl border border-white/5 bg-black/40 pl-10 pr-3.5 py-3 text-sm text-white outline-none focus:border-wave-accent/40 focus:bg-black/60 transition-all font-semibold"
              placeholder="Your name"
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="mt-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400" htmlFor="email">
            Email Address
          </label>
          <div className="relative mt-2">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500">
              <Mail size={16} />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              required
              className="w-full rounded-xl border border-white/5 bg-black/40 pl-10 pr-3.5 py-3 text-sm text-white outline-none focus:border-wave-accent/40 focus:bg-black/60 transition-all font-semibold"
              placeholder="name@example.com"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="mt-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400" htmlFor="password">
            Password (Min 8 characters)
          </label>
          <div className="relative mt-2">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500">
              <Key size={16} />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              minLength={8}
              required
              className="w-full rounded-xl border border-white/5 bg-black/40 pl-10 pr-3.5 py-3 text-sm text-white outline-none focus:border-wave-accent/40 focus:bg-black/60 transition-all font-semibold"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-wave-accent to-emerald-400 py-3.5 text-xs font-black uppercase tracking-wider text-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-wave-accent/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <UserPlus size={16} strokeWidth={3} />
          {isSubmitting ? "Creating account..." : "Create Account"}
        </button>

        <p className="mt-6 text-center text-xs font-semibold text-zinc-400">
          Already have an account?{" "}
          <Link className="font-bold text-white hover:text-wave-accent hover:underline transition-colors" to="/login">
            Login here
          </Link>
        </p>
      </form>
    </section>
  );
}

function NavLinkToLogo() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-wave-accent to-emerald-500 text-black shadow-lg shadow-wave-accent/25 animate-float">
      <Disc size={26} strokeWidth={2.5} className="animate-[spin_4s_linear_infinite]" />
    </div>
  );
}
