import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import Card from "./Card.jsx";

export default function RecentActivity({ id, items, currency, className = "" }) {
  const fmt = (n) => `${currency}${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  return (
    <Card id={id} className={className}>
      <h3 className="font-bold text-sm mb-3">Recent activity</h3>
      {items.length === 0 ? (
        <p className="text-ink/50 text-sm py-4 text-center">Nothing logged yet this month.</p>
      ) : (
        <ul className="divide-y divide-mist">
          {items.map((item) => (
            <li key={`${item.type}-${item.id}`} className="flex items-center gap-3 py-2.5">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  item.type === "income" ? "bg-sky/20 text-[#2e6f96]" : "bg-coral/15 text-[#c15a34]"
                }`}
                style={item.type === "expense" && item.color ? { backgroundColor: `${item.color}22`, color: item.color } : undefined}
              >
                {item.type === "income" ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink truncate">{item.label}</p>
                <p className="text-xs text-ink/45 truncate">{item.subtitle}</p>
              </div>
              <span
                className={`shrink-0 font-display text-sm font-bold tabular-nums ${
                  item.type === "income" ? "text-forest" : "text-coral"
                }`}
              >
                {item.type === "income" ? "+" : "−"}
                {fmt(item.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
