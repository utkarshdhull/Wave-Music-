export function EmptyState({ action, message, title = "Nothing here yet" }) {
  return (
    <div className="mt-6 rounded-lg border border-white/10 bg-wave-panel px-5 py-8 text-center">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

