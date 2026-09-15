import { shadeCss, shadeWashCss } from "../lib/shades.js";

export default function CategoryTile({ category, index = 0, amount, pct, barPct, currency, className = "", ...rest }) {
  const Icon = category.icon;
  return (
    <div
      className={`rounded-[1.4rem] border border-white/70 bg-surface p-3.5 shadow-[0_16px_34px_-28px_rgba(112,72,128,0.35)] ${className}`}
      {...rest}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: shadeWashCss(index), color: shadeCss(index) }}
        >
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{category.label}</p>
          <p className="text-xs text-ink/45">{pct.toFixed(0)}% of spending</p>
        </div>
      </div>
      <p className="mt-2.5 font-display text-lg font-extrabold tabular-nums text-ink">
        {currency}
        {amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </p>
      <div className="mt-2 h-2 rounded-full bg-mist overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${barPct}%`, backgroundColor: shadeCss(index) }}
        />
      </div>
    </div>
  );
}
