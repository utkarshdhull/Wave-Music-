/**
 * EqualizerBars – Animated premium equalizer visual.
 *
 * Props:
 *  color  – CSS color string (e.g. "rgb(29,185,84)")
 *  size   – "sm" | "md" | "lg"
 *  paused – when true the animation is paused (track paused)
 */
export function EqualizerBars({ color = "rgb(29,185,84)", size = "sm", paused = false }) {
  const configs = {
    sm: { height: "h-3.5", barW: "w-[2px]", gap: "gap-[2px]", bars: 4 },
    md: { height: "h-5", barW: "w-[2.5px]", gap: "gap-[2px]", bars: 5 },
    lg: { height: "h-8", barW: "w-[3px]", gap: "gap-[3px]", bars: 6 },
  };

  const cfg = configs[size] || configs.sm;

  const animClasses = [
    "animate-eq-1",
    "animate-eq-2",
    "animate-eq-3",
    "animate-eq-4",
    "animate-eq-5",
    "animate-eq-1", // fallback for 6th bar
  ];

  return (
    <div
      className={`flex items-end shrink-0 ${cfg.height} ${cfg.gap}`}
      aria-hidden="true"
    >
      {Array.from({ length: cfg.bars }).map((_, i) => (
        <span
          key={i}
          className={`${cfg.barW} rounded-full ${animClasses[i]} ${paused ? "eq-paused" : ""}`}
          style={{
            background: color,
            boxShadow: `0 0 4px ${color}`,
            height: "40%", // initial height; animation overrides
            minHeight: "2px",
            transition: "background 1s ease, box-shadow 1s ease",
          }}
        />
      ))}
    </div>
  );
}
