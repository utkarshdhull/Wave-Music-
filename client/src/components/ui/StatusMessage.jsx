const variants = {
  error: "bg-red-500/10 text-red-300",
  info: "bg-white/10 text-zinc-300",
  success: "bg-emerald-500/10 text-emerald-300"
};

export function StatusMessage({ children, variant = "info" }) {
  if (!children) {
    return null;
  }

  return <p className={`mt-6 rounded-md px-3 py-2 text-sm ${variants[variant]}`}>{children}</p>;
}

