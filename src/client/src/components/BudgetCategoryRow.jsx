import { shadeCss, shadeWashCss } from "../lib/shades.js";

// A single budget category as a list row rather than its own card — the brief calls out
// "everything is a card" as a problem, and a Card-per-category grid was the worst offender.
// Mirrors the row treatment already used for transactions (ExpensesPage's ExpenseRow) so the
// two list patterns feel like one system.
export default function BudgetCategoryRow({
  category,
  index = 0,
  budget,
  oneTime,
  spent,
  pct,
  barColor,
  overBudget,
  statusText,
  currency,
  isEditing,
  editValue,
  editRecurring,
  onStartEdit,
  onChangeEditValue,
  onChangeEditRecurring,
  onSaveEdit,
}) {
  const Icon = category.icon;

  return (
    <li className="relative py-3 pl-4 pr-3 hover:bg-mist/40 transition-colors duration-150">
      <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full" style={{ backgroundColor: shadeCss(index) }} />
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: shadeWashCss(index), color: shadeCss(index) }}
        >
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <span className="text-sm font-semibold text-ink truncate">{category.label}</span>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  autoFocus
                  value={editValue}
                  onChange={(e) => onChangeEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSaveEdit()}
                  className="w-20 rounded border border-mist px-2 py-1 text-sm"
                />
                <label className="flex items-center gap-1 text-xs text-ink/60">
                  <input type="checkbox" checked={editRecurring} onChange={(e) => onChangeEditRecurring(e.target.checked)} />
                  Recurring
                </label>
                <button onClick={onSaveEdit} className="rounded bg-[var(--accent)] text-white text-xs font-medium px-2 py-1 hover:bg-[var(--accent-hover)]">
                  Save
                </button>
              </div>
            ) : (
              <button onClick={onStartEdit} className="text-sm text-ink/60 hover:text-[var(--accent-text)] shrink-0">
                Budget: {currency}
                {budget.toLocaleString()}
                {oneTime && <span style={{ color: "var(--accent-text)" }}> (this month)</span>}
              </button>
            )}
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-mist overflow-hidden">
            <div className="h-full transition-all" style={{ width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: barColor }} />
          </div>
          <div className="flex items-center justify-between mt-1 text-xs text-ink/60">
            <span>
              Spent {currency}
              {spent.toLocaleString()}
            </span>
            <span className={overBudget ? "font-medium" : ""} style={overBudget ? { color: shadeCss(3) } : undefined}>{statusText}</span>
          </div>
        </div>
      </div>
    </li>
  );
}
