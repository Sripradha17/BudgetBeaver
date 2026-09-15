import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  PiggyBank,
  TrendingDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useData } from "../context/DataContext.jsx";
import { useMonth } from "../context/MonthContext.jsx";
import { monthKey } from "../lib/month.js";
import { buildMonthlyTrends } from "../lib/trends.js";
import Card from "../components/Card.jsx";
import PageHero from "../components/PageHero.jsx";
import RecentActivity from "../components/RecentActivity.jsx";
import { illustrations, HERO_ASPECT, illustrationEdgeColor } from "../assets/illustrations/index.js";
import { pageTheme } from "../theme/pageTheme.js";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function CurrencyTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-mist bg-surface2 px-3 py-2 text-xs shadow-soft">
      <p className="mb-0.5 font-semibold text-ink">{label}</p>
      <p className="text-[var(--accent-text)]">
        Spent: {currency}
        {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

function GoalRing({ pct }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div
      className="relative h-12 w-12 shrink-0 rounded-full"
      style={{ background: `conic-gradient(var(--accent) ${clamped * 3.6}deg, #E4E4DA 0deg)` }}
    >
      <div
        className="absolute inset-[3px] flex items-center justify-center rounded-full bg-surface text-[10px] font-extrabold"
        style={{ color: "var(--accent-text)" }}
      >
        {clamped.toFixed(0)}%
      </div>
    </div>
  );
}

export default function HomePage() {
  const { expenses, income, categories, goals, settings } = useData();
  const { selectedMonth, key } = useMonth();

  const categoryById = useMemo(() => {
    const map = {};
    categories.forEach((c) => (map[c.id] = c));
    return map;
  }, [categories]);

  const trendData = useMemo(() => buildMonthlyTrends(expenses, income, selectedMonth, 6), [expenses, income, selectedMonth]);
  const monthExpenses = useMemo(() => expenses.filter((e) => monthKey(new Date(e.date)) === key), [expenses, key]);
  const monthIncome = useMemo(() => income.filter((i) => monthKey(new Date(i.date)) === key), [income, key]);

  const totalIncome = monthIncome.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const currentBalance = trendData[trendData.length - 1]?.balance ?? totalIncome - totalExpenses;
  const prevBalance = trendData[trendData.length - 2]?.balance ?? null;
  const balanceChangePct =
    prevBalance && prevBalance !== 0 ? ((currentBalance - prevBalance) / Math.abs(prevBalance)) * 100 : null;
  const hasChange = balanceChangePct !== null && Number.isFinite(balanceChangePct);

  const goalsSummary = useMemo(() => {
    if (!goals.length) return null;
    let target = 0;
    let progress = 0;
    goals.forEach((g) => {
      target += g.targetAmount || 0;
      if (g.linkedCategoryId) {
        const start = new Date(g.startDate).getTime();
        progress += expenses
          .filter((e) => e.category === g.linkedCategoryId && new Date(e.date).getTime() >= start)
          .reduce((s, e) => s + e.amount, 0);
      } else {
        progress += g.manualProgress || 0;
      }
    });
    return { target, progress, pct: target > 0 ? Math.min(100, (progress / target) * 100) : 0 };
  }, [goals, expenses]);

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

  const fmt = (n) => `${settings.currency}${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  return (
    <div id="home-page" className="space-y-6">
      <PageHero
        id="home-hero"
        tint="forest"
        eyebrow="Dashboard"
        title={`${greeting()}, ${settings.myLabel}`}
        description="Here's your money at a glance this month — spending, income, and how close your goals are."
        image={illustrations.dashboard}
        aspect={HERO_ASPECT}
        edgeColor={illustrationEdgeColor.dashboard}
        heroHeight={500}
      >
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/55">
            {currentBalance < 0 ? "Over budget" : "Safe to spend"}
          </p>
          <p className="mt-1 font-display text-4xl font-extrabold leading-none tabular-nums sm:text-5xl">
            {currentBalance < 0 ? "-" : ""}
            {fmt(currentBalance)}
          </p>
          {hasChange ? (
            <div
              className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                balanceChangePct >= 0 ? "bg-white/18 text-white" : "bg-black/15 text-white/90"
              }`}
            >
              {balanceChangePct >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              {Math.abs(balanceChangePct).toFixed(0)}% from last month
            </div>
          ) : (
            <p className="mt-3 text-xs text-white/60">
              {currentBalance < 0
                ? "You've spent more than you've earned this month."
                : "This month's income minus spending."}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/expenses"
            className="flex items-center gap-1.5 rounded-full bg-white text-forest-dark text-sm font-bold px-4 py-2.5 hover:bg-white/90"
          >
            <Plus size={15} /> Add expense
          </Link>
          <Link
            to="/overview"
            className="flex items-center gap-1.5 rounded-full border border-white/30 text-white text-sm font-bold px-4 py-2.5 hover:bg-white/10"
          >
            View full overview
          </Link>
        </div>
      </PageHero>

      {/* Stat tiles: balance, income, expenses, goal progress ring */}
      <div id="home-stat-tiles" className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-[1.6rem] border p-4 shadow-[0_18px_36px_-28px_rgba(112,72,128,0.35)]" style={{ backgroundColor: "var(--tile-bg)", borderColor: "var(--tile-border)" }}>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink/50">Total balance</p>
          <p className="mt-2 font-display text-lg font-extrabold tabular-nums sm:text-2xl" style={{ color: "var(--accent-text)" }}>
            {currentBalance < 0 ? "-" : ""}
            {fmt(currentBalance)}
          </p>
        </div>
        <div className="rounded-[1.6rem] border p-4 shadow-[0_18px_36px_-28px_rgba(112,72,128,0.35)]" style={{ backgroundColor: "var(--tile-bg)", borderColor: "var(--tile-border)" }}>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink/50">Monthly income</p>
          <p className="mt-2 font-display text-lg font-extrabold tabular-nums sm:text-2xl" style={{ color: "var(--accent-text)" }}>{fmt(totalIncome)}</p>
        </div>
        <div className="rounded-[1.6rem] border p-4 shadow-[0_18px_36px_-28px_rgba(112,72,128,0.35)]" style={{ backgroundColor: "var(--tile-bg)", borderColor: "var(--tile-border)" }}>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink/50">Monthly expenses</p>
          <p className="mt-2 font-display text-lg font-extrabold tabular-nums sm:text-2xl" style={{ color: "var(--accent-text)" }}>{fmt(totalExpenses)}</p>
        </div>
        <div className="flex items-center gap-3 rounded-[1.6rem] border p-4 shadow-[0_18px_36px_-28px_rgba(112,72,128,0.35)]" style={{ backgroundColor: "var(--tile-bg)", borderColor: "var(--tile-border)" }}>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase leading-tight tracking-[0.18em] text-ink/50">Savings goal</p>
            <p className="mt-2 truncate font-display text-lg font-extrabold tabular-nums sm:text-xl" style={{ color: "var(--accent-text)" }}>
              {goalsSummary ? fmt(goalsSummary.progress) : "—"}
            </p>
          </div>
          {goalsSummary && <GoalRing pct={goalsSummary.pct} />}
        </div>
      </div>

      {/* Asymmetric second row: spending chart (wider) + recent activity (narrower) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card id="home-spending-chart">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 font-bold text-sm">
              <TrendingDown size={15} className="text-[var(--accent-text)]" /> Spending overview
            </h3>
            <span className="text-xs text-ink/40">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trendData} margin={{ left: 0, right: 4, top: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={pageTheme.dashboard.cardBorder} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: pageTheme.dashboard.text }} axisLine={false} tickLine={false} />
              <Tooltip
                content={<CurrencyTooltip currency={settings.currency} />}
                cursor={{ fill: pageTheme.dashboard.tileBg, opacity: 0.5 }}
              />
              <Bar dataKey="expenses" name="Spent" fill={pageTheme.dashboard.graphColor} radius={[8, 8, 0, 0]} maxBarSize={38} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <RecentActivity id="home-recent-activity" items={recentActivity} currency={settings.currency} />
      </div>
    </div>
  );
}
