import { useEffect, useState } from "react";
import { factForIndex } from "../lib/moneyFacts.js";

export default function MoneyFactCard({ className = "" }) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * 10));

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => i + 1), 9000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={`relative overflow-hidden rounded-[1.75rem] border p-4 shadow-soft ${className}`}
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--card-border)",
        backgroundImage: "linear-gradient(135deg, var(--card-bg), var(--tile-bg))",
      }}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] blur-2xl" />
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 shrink-0 rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-hover))] shadow-[0_14px_20px_-18px_rgba(0,0,0,0.8)]" />
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--accent-text)]">Money fact</p>
          <p key={index} className="mt-1 text-sm text-ink/80 animate-page-in">
            {factForIndex(index)}
          </p>
        </div>
      </div>
    </div>
  );
}
