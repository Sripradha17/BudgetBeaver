import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Sparkles, PiggyBank, Download } from "lucide-react";
import { useData } from "../context/DataContext.jsx";
import { useMonth } from "../context/MonthContext.jsx";
import { buildMonthlyTrends } from "../lib/trends.js";
import { shiftMonth } from "../lib/month.js";
import Card from "../components/Card.jsx";
import CategoryBadge from "../components/CategoryBadge.jsx";
import { categoryIndex } from "../lib/categories.js";
import { shadeCss } from "../lib/shades.js";
import PageHero from "../components/PageHero.jsx";
import { illustrations, HERO_ASPECT, illustrationEdgeColor } from "../assets/illustrations/index.js";
import { IncomeExpenseTrendChart, SavingsInvestmentTrendChart } from "../components/TrendCharts.jsx";
import { exportExpensesCsv, exportIncomeCsv } from "../lib/exportData.js";

const TREND_RANGES = [
  { label: "3 months", months: 3 },
  { label: "6 months", months: 6 },
  { label: "12 months", months: 12 },
  { label: "24 months", months: 24 },
];

// Scopes the top-line stat tiles / invested list / exports — separate from
// the trend-chart range below, which controls chart granularity, not totals.
const STATS_SCOPES = [
  { label: "All time", value: "all" },
  { label: "This year", value: "year" },
  { label: "Last 12 months", value: "12m" },
];

function withinScope(dateValue, scope) {
  if (scope === "all") return true;
  const d = new Date(dateValue);
  const now = new Date();
  if (scope === "year") return d.getFullYear() === now.getFullYear();
  if (scope === "12m") {
    const cutoff = shiftMonth(new Date(now.getFullYear(), now.getMonth(), 1), -11);
    return d >= cutoff;
  }
  return true;
}

// Money moved into an Investment/Savings-flavored category isn't "spent" —
// it's still yours, just in a different form — so it's excluded from
// spending and added back into net worth instead of subtracted from it.
function isWealthCategory(category) {
  const text = `${category?.id || ""} ${category?.label || ""}`.toLowerCase();
  return text.includes("invest") || text.includes("saving");
}

export default function ReportsPage() {
  const { expenses, income, categories, settings } = useData();
  const { selectedMonth } = useMonth();
  const [trendMonths, setTrendMonths] = useState(6);
  const [statsScope, setStatsScope] = useState("all");

  const categoryById = useMemo(() => {
    const map = {};
    categories.forEach((c) => (map[c.id] = c));
    return map;
  }, [categories]);

  const scopedExpenses = useMemo(
    () => expenses.filter((e) => withinScope(e.date, statsScope)),
    [expenses, statsScope]
  );
  const scopedIncome = useMemo(
    () => income.filter((i) => withinScope(i.date, statsScope)),
    [income, statsScope]
  );

  const totals = useMemo(() => {
    const totalIncome = scopedIncome.reduce((s, i) => s + i.amount, 0);
    let spending = 0;
    let investedAndSaved = 0;
    for (const e of scopedExpenses) {
      if (isWealthCategory(categoryById[e.category])) {
        investedAndSaved += e.amount;
      } else {
        spending += e.amount;
      }
    }
    return { totalIncome, spending, investedAndSaved, netWorth: totalIncome - spending };
  }, [scopedExpenses, scopedIncome, categoryById]);

  const savingsRate = totals.totalIncome > 0 ? (totals.investedAndSaved / totals.totalIncome) * 100 : 0;

  const wealthByCategory = useMemo(() => {
    const map = {};
    for (const e of scopedExpenses) {
      const cat = categoryById[e.category];
      if (!isWealthCategory(cat)) continue;
      map[e.category] = (map[e.category] || 0) + e.amount;
    }
    return Object.entries(map)
      .map(([id, total]) => ({ category: categoryById[id], total }))
      .filter((r) => r.category)
      .sort((a, b) => b.total - a.total);
  }, [scopedExpenses, categoryById]);

  // "All time" only actually means "since you started tracking" — so name that
  // start date instead of implying data goes back further than it does.
  const trackingStartLabel = useMemo(() => {
    const allDates = [...expenses, ...income].map((r) => new Date(r.date));
    if (allDates.length === 0) return null;
    return new Date(Math.min(...allDates)).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [expenses, income]);

  const scopeLabel =
    statsScope === "all" && trackingStartLabel
      ? `since ${trackingStartLabel}`
      : STATS_SCOPES.find((s) => s.value === statsScope).label.toLowerCase();

  const trendData = useMemo(
    () => buildMonthlyTrends(expenses, income, selectedMonth, trendMonths),
    [expenses, income, selectedMonth, trendMonths]
  );

  const fmt = (n) => `${settings.currency}${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  return (
    <div id="reports-page" className="space-y-5">
      <PageHero
        id="reports-hero"
        tint="coral"
        eyebrow="Reports"
        title="See the whole picture"
        description="Income, spending, and how much you've put toward savings and investments."
        image={illustrations.reports}
        aspect={HERO_ASPECT}
        edgeColor={illustrationEdgeColor.reports}
      >
        <div className="flex flex-wrap gap-2.5">
          <button
            id="reports-export-expenses"
            onClick={() => exportExpensesCsv(scopedExpenses, categoryById, settings)}
            disabled={scopedExpenses.length === 0}
            className="flex items-center gap-1.5 rounded-full bg-white text-[var(--accent-text)] text-sm font-bold px-4 py-2.5 hover:bg-white/90 disabled:opacity-50"
          >
            <Download size={15} /> Export expenses
          </button>
          <button
            id="reports-export-income"
            onClick={() => exportIncomeCsv(scopedIncome, settings)}
            disabled={scopedIncome.length === 0}
            className="flex items-center gap-1.5 rounded-full border border-white/30 text-white text-sm font-bold px-4 py-2.5 hover:bg-white/10 disabled:opacity-50"
          >
            <Download size={15} /> Export income
          </button>
        </div>
      </PageHero>

      <Card id="reports-stats-scope" className="flex items-center gap-2 !p-2.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink/40 pl-1.5">Showing</span>
        <div className="flex rounded-lg border border-mist bg-white p-0.5 text-xs">
          {STATS_SCOPES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatsScope(s.value)}
              className={`rounded-md px-2.5 py-1 font-medium ${
                statsScope === s.value ? "bg-[var(--accent)] text-white" : "text-ink/70 hover:text-ink"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </Card>

      <div id="reports-stat-tiles" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card id="reports-net-worth" className="text-center">
          <p className="text-xs text-ink/50 uppercase">Net worth</p>
          <p
            className="font-display font-bold text-3xl"
            style={{ color: totals.netWorth >= 0 ? "var(--accent-text)" : shadeCss(1) }}
          >
            {totals.netWorth < 0 ? "-" : ""}
            {fmt(Math.abs(totals.netWorth))}
          </p>
          <p className="text-xs text-ink/40 mt-1.5">Earned minus everyday spending, {scopeLabel}</p>
        </Card>
        <Card id="reports-total-income">
          <p className="text-xs text-ink/50 uppercase mb-1">Total income, {scopeLabel}</p>
          <p className="font-display font-bold text-xl text-[var(--accent-text)] flex items-center gap-1.5">
            <TrendingUp size={18} /> {fmt(totals.totalIncome)}
          </p>
        </Card>
        <Card id="reports-savings-rate">
          <p className="text-xs text-ink/50 uppercase mb-1">Savings rate</p>
          <p className="font-display font-bold text-xl text-[var(--accent-text)] flex items-center gap-1.5">
            <PiggyBank size={18} /> {savingsRate.toFixed(0)}%
          </p>
          <p className="text-xs text-ink/40 mt-0.5">Of income invested or saved, {scopeLabel}</p>
        </Card>
      </div>

      <Card id="reports-trend-range" className="flex items-center gap-2 !p-2.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink/40 pl-1.5">Trend range</span>
        <div className="flex rounded-lg border border-mist bg-white p-0.5 text-xs">
          {TREND_RANGES.map((r) => (
            <button
              key={r.months}
              onClick={() => setTrendMonths(r.months)}
              className={`rounded-md px-2.5 py-1 font-medium ${
                trendMonths === r.months ? "bg-[var(--accent)] text-white" : "text-ink/70 hover:text-ink"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </Card>

      <div id="reports-charts" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <IncomeExpenseTrendChart data={trendData} currency={settings.currency} />
        <SavingsInvestmentTrendChart data={trendData} currency={settings.currency} />
      </div>

      <Card id="reports-invested-saved">
        <h2 className="font-bold text-lg mb-3 flex items-center gap-1.5">
          <Sparkles size={17} className="text-[var(--accent-text)]" /> Invested & saved
          <span className="text-xs font-normal text-ink/40 normal-case">({scopeLabel})</span>
        </h2>
        {wealthByCategory.length === 0 ? (
          <div className="flex flex-col items-center py-6 gap-2">
            <p className="text-ink/50 text-sm text-center">
              Nothing logged in an Investment or Savings category {statsScope === "all" ? "yet" : `for ${scopeLabel}`}.
            </p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-mist">
              {wealthByCategory.map(({ category, total }) => (
                <li key={category.id} className="flex items-center justify-between py-2.5">
                  <CategoryBadge category={category} index={categoryIndex(categories, category.id)} />
                  <span className="text-sm font-semibold text-[var(--accent-text)]">{fmt(total)}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between pt-2 mt-1 border-t border-mist text-sm font-bold">
              <span>Total</span>
              <span>{fmt(totals.investedAndSaved)}</span>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
