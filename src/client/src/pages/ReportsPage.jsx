import { useMemo } from "react";
import { TrendingUp, TrendingDown, Sparkles, PiggyBank } from "lucide-react";
import { useData } from "../context/DataContext.jsx";
import { useMonth } from "../context/MonthContext.jsx";
import { buildMonthlyTrends } from "../lib/trends.js";
import Card from "../components/Card.jsx";
import CategoryBadge from "../components/CategoryBadge.jsx";
import { categoryIndex } from "../lib/categories.js";
import { shadeCss } from "../lib/shades.js";
import PageHero from "../components/PageHero.jsx";
import { illustrations, HERO_ASPECT, illustrationEdgeColor } from "../assets/illustrations/index.js";
import { IncomeExpenseTrendChart, SavingsInvestmentTrendChart } from "../components/TrendCharts.jsx";

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

  const categoryById = useMemo(() => {
    const map = {};
    categories.forEach((c) => (map[c.id] = c));
    return map;
  }, [categories]);

  const totals = useMemo(() => {
    const totalIncome = income.reduce((s, i) => s + i.amount, 0);
    let spending = 0;
    let investedAndSaved = 0;
    for (const e of expenses) {
      if (isWealthCategory(categoryById[e.category])) {
        investedAndSaved += e.amount;
      } else {
        spending += e.amount;
      }
    }
    return { totalIncome, spending, investedAndSaved, netWorth: totalIncome - spending };
  }, [expenses, income, categoryById]);

  const savingsRate = totals.totalIncome > 0 ? (totals.investedAndSaved / totals.totalIncome) * 100 : 0;

  const wealthByCategory = useMemo(() => {
    const map = {};
    for (const e of expenses) {
      const cat = categoryById[e.category];
      if (!isWealthCategory(cat)) continue;
      map[e.category] = (map[e.category] || 0) + e.amount;
    }
    return Object.entries(map)
      .map(([id, total]) => ({ category: categoryById[id], total }))
      .filter((r) => r.category)
      .sort((a, b) => b.total - a.total);
  }, [expenses, categoryById]);

  const trendData = useMemo(() => buildMonthlyTrends(expenses, income, selectedMonth, 6), [expenses, income, selectedMonth]);

  const fmt = (n) => `${settings.currency}${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  return (
    <div id="reports-page" className="space-y-5">
      <PageHero
        id="reports-hero"
        tint="coral"
        eyebrow="Reports"
        title="See the whole picture"
        description="All-time trends across income, spending, and how much you've put toward savings and investments."
        image={illustrations.reports}
        aspect={HERO_ASPECT}
        edgeColor={illustrationEdgeColor.reports}
      />

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
          <p className="text-xs text-ink/40 mt-1.5">Earned minus everyday spending, all time</p>
        </Card>
        <Card id="reports-total-income">
          <p className="text-xs text-ink/50 uppercase mb-1">Total income, all time</p>
          <p className="font-display font-bold text-xl text-[var(--accent-text)] flex items-center gap-1.5">
            <TrendingUp size={18} /> {fmt(totals.totalIncome)}
          </p>
        </Card>
        <Card id="reports-savings-rate">
          <p className="text-xs text-ink/50 uppercase mb-1">Savings rate</p>
          <p className="font-display font-bold text-xl text-[var(--accent-text)] flex items-center gap-1.5">
            <PiggyBank size={18} /> {savingsRate.toFixed(0)}%
          </p>
          <p className="text-xs text-ink/40 mt-0.5">Of all-time income invested or saved</p>
        </Card>
      </div>

      <div id="reports-charts" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <IncomeExpenseTrendChart data={trendData} currency={settings.currency} />
        <SavingsInvestmentTrendChart data={trendData} currency={settings.currency} />
      </div>

      <Card id="reports-invested-saved">
        <h2 className="font-bold text-lg mb-3 flex items-center gap-1.5">
          <Sparkles size={17} className="text-[var(--accent-text)]" /> Invested & saved
        </h2>
        {wealthByCategory.length === 0 ? (
          <div className="flex flex-col items-center py-6 gap-2">
            <p className="text-ink/50 text-sm text-center">
              Nothing logged in an Investment or Savings category yet.
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
