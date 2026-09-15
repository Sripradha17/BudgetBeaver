import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import Card from "./Card.jsx";
import { pageTheme } from "../theme/pageTheme.js";

// This chart only ever renders on the Reports page, so its four series get
// literal same-hue shades of that page's accent (mixed in plain JS, since
// recharts needs real color values, not CSS custom properties) instead of
// four unrelated hues.
function mixHex(hexA, hexB, t) {
  const toRgb = (h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  const a = toRgb(hexA.replace("#", ""));
  const b = toRgb(hexB.replace("#", ""));
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

const ACCENT = pageTheme.reports.accent;
const COLORS = {
  income: mixHex(ACCENT, "#ffffff", 0.5),
  expenses: mixHex(ACCENT, "#000000", 0.3),
  savings: mixHex(ACCENT, "#ffffff", 0.15),
  investment: mixHex(ACCENT, "#000000", 0.55),
};
const GRID_COLOR = mixHex(ACCENT, "#ffffff", 0.82);
const AXIS_TICK = { fontSize: 12, fill: mixHex(ACCENT, "#ffffff", 0.35) };
const LEGEND_STYLE = { fontSize: 12, color: mixHex(ACCENT, "#000000", 0.15) };

function CurrencyTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface2 rounded-lg shadow-soft px-3 py-2 text-xs border border-mist">
      <p className="font-semibold mb-1 text-ink">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {currency}
          {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export function IncomeExpenseTrendChart({ data, currency }) {
  return (
    <Card id="reports-income-expense-chart">
      <h3 className="font-bold mb-3">Income vs. expenses by month</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ left: 0, right: 10 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="label" tick={AXIS_TICK} />
          <YAxis tick={AXIS_TICK} width={50} />
          <Tooltip content={<CurrencyTooltip currency={currency} />} cursor={{ fill: "#ffffff0d" }} />
          <Legend wrapperStyle={LEGEND_STYLE} />
          <Bar dataKey="income" name="Income" fill={COLORS.income} radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="Expenses" fill={COLORS.expenses} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function SavingsInvestmentTrendChart({ data, currency }) {
  return (
    <Card id="reports-savings-investment-chart">
      <h3 className="font-bold mb-3">Savings &amp; investment growth over time</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ left: 0, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis dataKey="label" tick={AXIS_TICK} />
          <YAxis tick={AXIS_TICK} width={50} />
          <Tooltip content={<CurrencyTooltip currency={currency} />} />
          <Legend wrapperStyle={LEGEND_STYLE} />
          <Line
            type="monotone"
            dataKey="savingsCumulative"
            name="Savings (total)"
            stroke={COLORS.savings}
            strokeWidth={2.5}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="investmentCumulative"
            name="Investment (total)"
            stroke={COLORS.investment}
            strokeWidth={2.5}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
