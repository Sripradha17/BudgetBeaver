import { Target } from "lucide-react";
import Card from "./Card.jsx";
import { categoryIndex } from "../lib/categories.js";
import { shadeCss } from "../lib/shades.js";

export default function BudgetOverviewCard({ rows, allCategories, totalBudget, totalSpent, currency, className = "" }) {
  const overallPct = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;
  const fmt = (n) => `${currency}${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const overallColor = overallPct >= 100 ? shadeCss(3) : overallPct >= 80 ? shadeCss(2) : shadeCss(4);

  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-sm flex items-center gap-1.5">
          <Target size={15} className="text-[var(--accent-text)]" /> Monthly budget
        </h3>
        <span className="text-xs font-bold text-ink/50">{overallPct.toFixed(0)}% used</span>
      </div>

      {totalBudget === 0 ? (
        <p className="text-ink/50 text-sm py-4 text-center">
          Set a budget for a category to see your progress here.
        </p>
      ) : (
        <>
          <p className="font-display text-2xl font-extrabold text-ink tabular-nums">
            {fmt(totalSpent)} <span className="text-base font-semibold text-ink/40">/ {fmt(totalBudget)}</span>
          </p>
          <div className="mt-2.5 h-3 rounded-full bg-mist overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{ width: `${overallPct}%`, backgroundColor: overallColor }}
            />
          </div>

          <ul className="mt-4 space-y-3">
            {rows.slice(0, 4).map((r) => {
              const pct = r.budget > 0 ? Math.min(100, (r.spent / r.budget) * 100) : 0;
              const Icon = r.category.icon;
              const idx = categoryIndex(allCategories, r.category.id);
              return (
                <li key={r.category.id}>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-ink/75">
                      <Icon size={12} style={{ color: shadeCss(idx) }} />
                      {r.category.label}
                    </span>
                    <span className="text-ink/45 tabular-nums">
                      {fmt(r.spent)} / {fmt(r.budget)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-mist overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-700 ease-out"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct >= 100 ? shadeCss(3) : shadeCss(idx),
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Card>
  );
}
