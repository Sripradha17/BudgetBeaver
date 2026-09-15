const TONES = {
  sky: { bg: "bg-sky/[0.14]", chip: "bg-sky/25", text: "text-[#2e6f96]", ring: "border-sky/30" },
  coral: { bg: "bg-coral/[0.12]", chip: "bg-coral/25", text: "text-[#c15a34]", ring: "border-coral/30" },
  forest: { bg: "bg-forest/[0.1]", chip: "bg-forest/20", text: "text-forest", ring: "border-forest/25" },
  plum: { bg: "bg-plum/[0.14]", chip: "bg-plum/25", text: "text-[#7c5bab]", ring: "border-plum/30" },
};

// "accent" pulls from the current page's CSS variables (set in AppShell from
// that page's hero image) instead of a fixed brand color, so stat tiles stay
// color-matched to whichever page they're rendered on.
export default function StatTile({ label, value, sublabel, icon: Icon, tone = "forest", className = "" }) {
  if (tone === "accent") {
    return (
      <div
        className={`relative overflow-hidden rounded-[1.6rem] border p-4 shadow-[0_18px_36px_-28px_rgba(112,72,128,0.35)] ${className}`}
        style={{ backgroundColor: "var(--tile-bg)", borderColor: "var(--tile-border)" }}
      >
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--accent)", color: "#fff" }}
        >
          <Icon size={17} />
        </div>
        <p className="mt-3 truncate text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink/50">{label}</p>
        <p
          key={value}
          className="mt-0.5 font-display text-lg sm:text-2xl font-extrabold tabular-nums animate-page-in truncate"
          style={{ color: "var(--accent-text)" }}
        >
          {value}
        </p>
        {sublabel && <p className="mt-0.5 text-xs text-ink/45">{sublabel}</p>}
      </div>
    );
  }

  const t = TONES[tone] || TONES.forest;
  return (
    <div
      className={`relative overflow-hidden rounded-[1.6rem] border ${t.ring} ${t.bg} p-4 shadow-[0_18px_36px_-28px_rgba(112,72,128,0.35)] ${className}`}
    >
      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${t.chip} ${t.text}`}>
        <Icon size={17} />
      </div>
      <p className="mt-3 truncate text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink/50">{label}</p>
      <p
        key={value}
        className={`font-display text-lg sm:text-2xl font-extrabold tabular-nums animate-page-in truncate ${t.text}`}
      >
        {value}
      </p>
      {sublabel && <p className="mt-0.5 text-xs text-ink/45">{sublabel}</p>}
    </div>
  );
}
