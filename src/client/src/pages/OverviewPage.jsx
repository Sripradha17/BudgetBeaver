import { useMemo } from "react";
import { Download, TrendingUp, TrendingDown, Sparkles, PieChart, Wallet, PiggyBank } from "lucide-react";
import { useData } from "../context/DataContext.jsx";
import { useMonth } from "../context/MonthContext.jsx";
import { monthKey } from "../lib/month.js";
import { buildMonthlyTrends } from "../lib/trends.js";
import { buildInsights } from "../lib/insights.js";
import { getEffectiveBudget } from "../lib/budgets.js";
import { categoryIndex } from "../lib/categories.js";
import Card from "../components/Card.jsx";
import SafeToSpendCard from "../components/SafeToSpendCard.jsx";
import StatTile from "../components/StatTile.jsx";
import BudgetOverviewCard from "../components/BudgetOverviewCard.jsx";
import RecentActivity from "../components/RecentActivity.jsx";
import CategoryTile from "../components/CategoryTile.jsx";
import MoneyFactCard from "../components/MoneyFactCard.jsx";
import { exportMonthToExcel } from "../lib/exportExcel.js";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function OverviewPage() {
  const { expenses, income, categories, settings } = useData();
  const { selectedMonth, key } = useMonth();

  const categoryById = useMemo(() => {
    const map = {};
    categories.forEach((c) => (map[c.id] = c));
    return map;
  }, [categories]);

  const monthExpenses = useMemo(
    () => expenses.filter((e) => monthKey(new Date(e.date)) === key),
    [expenses, key]
  );
  const monthIncome = useMemo(
    () => income.filter((i) => monthKey(new Date(i.date)) === key),
    [income, key]
  );

  const spentByCategory = useMemo(() => {
    const map = {};
    monthExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }, [monthExpenses]);

  const byCategory = useMemo(() => {
    return Object.entries(spentByCategory)
      .map(([id, total]) => ({ category: categoryById[id], total }))
      .filter((row) => row.category)
      .sort((a, b) => b.total - a.total);
  }, [spentByCategory, categoryById]);

  const totalExpenses = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = monthIncome.reduce((s, i) => s + i.amount, 0);
  const savingsThisMonth = monthExpenses
    .filter((e) => categoryById[e.category]?.isFloorGoal)
    .reduce((s, e) => s + e.amount, 0);
  const maxTotal = byCategory[0]?.total || 1;

  const trendData = useMemo(
    () => buildMonthlyTrends(expenses, income, selectedMonth, 6),
    [expenses, income, selectedMonth]
  );

  const currentBalance = trendData[trendData.length - 1]?.balance ?? totalIncome - totalExpenses;
  const prevBalance = trendData[trendData.length - 2]?.balance ?? null;
  const balanceChangePct =
    prevBalance && prevBalance !== 0 ? ((currentBalance - prevBalance) / Math.abs(prevBalance)) * 100 : null;

  const budgetRows = useMemo(() => {
    return categories
      .map((c) => ({ category: c, budget: getEffectiveBudget(settings, c.id, key), spent: spentByCategory[c.id] || 0 }))
      .filter((r) => r.budget > 0)
      .sort((a, b) => b.spent / b.budget - a.spent / a.budget);
  }, [categories, settings, key, spentByCategory]);
  const totalBudget = budgetRows.reduce((s, r) => s + r.budget, 0);
  const totalBudgetSpent = budgetRows.reduce((s, r) => s + r.spent, 0);

  const recentActivity = useMemo(() => {
    const expenseItems = monthExpenses.map((e) => ({
      id: e._id,
      type: "expense",
      date: e.date,
      amount: e.amount,
      label: e.note || categoryById[e.category]?.label || "Expense",
      subtitle: categoryById[e.category]?.label || "",
      color: categoryById[e.category]?.badgeColor,
    }));
    const incomeItems = monthIncome.map((i) => ({
      id: i._id,
      type: "income",
      date: i.date,
      amount: i.amount,
      label: i.note || (i.person === "spouse" ? settings.spouseLabel : settings.myLabel),
      subtitle: "Income",
    }));
    return [...expenseItems, ...incomeItems].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
  }, [monthExpenses, monthIncome, categoryById, settings]);

  const insights = useMemo(() => buildInsights(expenses, categories, key), [expenses, categories, key]);

  const fmt = (n) => `${settings.currency}${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  function handleExport() {
    exportMonthToExcel({
      monthDate: selectedMonth,
      monthKeyStr: key,
      categories,
      settings,
      monthExpenses,
      monthIncome,
    });
  }

  return (
    <div id="overview-page" className="space-y-5">
      <div id="overview-header" className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[var(--shell-text)] sm:text-[1.7rem]">
            {greeting()}, {settings.myLabel} 👋
          </h1>
          <p
            className="mt-0.5 text-sm"
            style={{ color: "color-mix(in srgb, var(--shell-text) 65%, transparent)" }}
          >
            Here's how your money is doing.
          </p>
        </div>
        <button
          id="overview-export-button"
          onClick={handleExport}
          className="hidden items-center gap-1.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium px-3 py-2 hover:bg-[var(--accent-hover)] hover:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_25%,transparent)] sm:flex"
        >
          <Download size={16} /> Export
        </button>
      </div>

      <SafeToSpendCard id="overview-safe-to-spend" amount={currentBalance} currency={settings.currency} changePct={balanceChangePct} />

      <div id="overview-stat-tiles" className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatTile label="Income" value={fmt(totalIncome)} icon={Wallet} tone="accent" />
        <StatTile label="Expenses" value={fmt(totalExpenses)} icon={TrendingDown} tone="accent" />
        <StatTile label="Savings" value={fmt(savingsThisMonth)} icon={PiggyBank} tone="accent" className="col-span-2 sm:col-span-1" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-4">
        <BudgetOverviewCard
          id="overview-budget-card"
          rows={budgetRows}
          allCategories={categories}
          totalBudget={totalBudget}
          totalSpent={totalBudgetSpent}
          currency={settings.currency}
        />
        <RecentActivity id="overview-recent-activity" items={recentActivity} currency={settings.currency} />
      </div>

      <MoneyFactCard id="overview-money-fact" />

      {insights.hasPrevData && (insights.changes.length > 0 || insights.totalPct !== null) && (
        <Card id="overview-insights">
          <h3 className="font-bold text-sm flex items-center gap-1.5 mb-3">
            <Sparkles size={15} className="text-[var(--accent-text)]" /> What changed this month
          </h3>
          <ul className="space-y-1.5 text-sm">
            {insights.totalPct !== null && Math.abs(insights.totalPct) >= 10 && (
              <li
                className={`relative flex items-center gap-2 py-1.5 pl-3 pr-2 rounded-lg animate-page-in ${
                  insights.totalPct > 0 ? "bg-coral/[0.06]" : "bg-teal/[0.06]"
                }`}
              >
                <span
                  className={`absolute left-0 top-1 bottom-1 w-[3px] rounded-full ${
                    insights.totalPct > 0 ? "bg-coral" : "bg-teal"
                  }`}
                />
                {insights.totalPct > 0 ? (
                  <TrendingUp size={15} className="text-coral shrink-0" />
                ) : (
                  <TrendingDown size={15} className="text-teal shrink-0" />
                )}
                <span>
                  Total spending is{" "}
                  <span className={insights.totalPct > 0 ? "text-coral font-medium" : "text-teal font-medium"}>
                    {insights.totalPct > 0 ? "up" : "down"} {Math.abs(insights.totalPct).toFixed(0)}%
                  </span>{" "}
                  from last month
                </span>
              </li>
            )}
            {insights.changes.map((c, idx) => (
              <li
                key={c.id}
                style={{ animationDelay: `${idx * 40}ms` }}
                className={`relative flex items-center gap-2 py-1.5 pl-3 pr-2 rounded-lg animate-page-in ${
                  c.kind === "down" ? "bg-teal/[0.06]" : "bg-coral/[0.06]"
                }`}
              >
                <span
                  className={`absolute left-0 top-1 bottom-1 w-[3px] rounded-full ${
                    c.kind === "down" ? "bg-teal" : "bg-coral"
                  }`}
                />
                {c.kind === "down" ? (
                  <TrendingDown size={15} className="text-teal shrink-0" />
                ) : (
                  <TrendingUp size={15} className="text-coral shrink-0" />
                )}
                <span>
                  {c.kind === "new" ? (
                    <>
                      New spending in <span className="font-medium">{c.label}</span>: {settings.currency}
                      {c.delta.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </>
                  ) : (
                    <>
                      <span className="font-medium">{c.label}</span> is{" "}
                      <span className={c.kind === "up" ? "text-coral font-medium" : "text-teal font-medium"}>
                        {c.kind === "up" ? "up" : "down"} {Math.abs(c.pct).toFixed(0)}%
                      </span>{" "}
                      from last month
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <h2 id="overview-category-breakdown-heading" className="font-bold text-lg flex items-center gap-1.5 text-[var(--shell-text)]">
        <PieChart size={18} className="text-[var(--accent)]" /> This month's category breakdown
      </h2>
      {byCategory.length === 0 ? (
        <Card id="overview-category-breakdown">
          <p className="text-ink/50 text-sm py-6 text-center">
            No expenses yet this month — log one to see your breakdown.
          </p>
        </Card>
      ) : (
        <div id="overview-category-breakdown" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {byCategory.map(({ category, total }, idx) => (
            <CategoryTile
              key={category.id}
              category={category}
              index={categoryIndex(categories, category.id)}
              amount={total}
              pct={totalExpenses > 0 ? (total / totalExpenses) * 100 : 0}
              barPct={(total / maxTotal) * 100}
              currency={settings.currency}
              className="animate-page-in"
              style={{ animationDelay: `${idx * 35}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
