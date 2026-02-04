const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium " +
  "transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/40";

export function Button({ children, className = "", disabled, ...props }) {
  return (
    <button
      disabled={disabled}
      className={[
        base,
        "bg-white text-slate-900",
        "hover:bg-slate-100 active:bg-slate-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, className = "", disabled, ...props }) {
  return (
    <button
      disabled={disabled}
      className={[
        base,
        "border border-white/10 text-slate-200",
        "hover:bg-white/5 hover:border-white/20",
        "active:bg-white/10",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
