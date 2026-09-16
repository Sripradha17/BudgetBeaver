import { useEffect, useMemo, useState } from "react";
import { Download, Check } from "lucide-react";
import { useData } from "../context/DataContext.jsx";
import { useMonth } from "../context/MonthContext.jsx";
import { monthKey } from "../lib/month.js";
import Card from "../components/Card.jsx";
import BudgetCategoryRow from "../components/BudgetCategoryRow.jsx";
import PageHero from "../components/PageHero.jsx";
import { illustrations, HERO_ASPECT, illustrationEdgeColor } from "../assets/illustrations/index.js";
import { exportMonthToExcel } from "../lib/exportExcel.js";
import { getEffectiveBudget, isOneTimeBudget, oneTimeBudgetKey } from "../lib/budgets.js";
import { categoryIndex } from "../lib/categories.js";
import { shadeCss } from "../lib/shades.js";

export default function BudgetsPage() {
  const { expenses, income, categories, settings, setBudget, updateSettings } = useData();
  const { selectedMonth, key } = useMonth();
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editRecurring, setEditRecurring] = useState(true);

  const [pickerCategoryId, setPickerCategoryId] = useState(categories[0]?.id || "");
  const [pickerAmount, setPickerAmount] = useState("");
  const [pickerRecurring, setPickerRecurring] = useState(true);
  const [pickerSaving, setPickerSaving] = useState(false);
  const [pickerSaved, setPickerSaved] = useState(false);

  useEffect(() => {
    if (!pickerCategoryId && categories[0]) setPickerCategoryId(categories[0].id);
  }, [categories, pickerCategoryId]);

  useEffect(() => {
    if (!pickerCategoryId) return;
    setPickerAmount(String(getEffectiveBudget(settings, pickerCategoryId, key) || ""));
    setPickerRecurring(!isOneTimeBudget(settings, pickerCategoryId, key));
    setPickerSaved(false);
  }, [pickerCategoryId, key, settings]);

  async function handlePickerSave() {
    setPickerSaving(true);
    try {
      const amount = parseFloat(pickerAmount) || 0;
      if (pickerRecurring) {
        await setBudget(pickerCategoryId, amount, null);
        // Switching back to "recurring" must also clear any existing one-time
        // override for this month, otherwise getEffectiveBudget keeps
        // preferring the stale override and the recurring value never shows.
        if (isOneTimeBudget(settings, pickerCategoryId, key)) {
          const next = { ...settings.oneTimeBudgets };
          delete next[oneTimeBudgetKey(key, pickerCategoryId)];
          await updateSettings({ oneTimeBudgets: next });
        }
      } else {
        await setBudget(pickerCategoryId, amount, key);
      }
      setPickerSaved(true);
    } finally {
      setPickerSaving(false);
    }
  }

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

  function startEdit(c) {
    setEditingId(c.id);
    setEditValue(String(getEffectiveBudget(settings, c.id, key) || ""));
    setEditRecurring(!isOneTimeBudget(settings, c.id, key));
  }

  async function saveEdit(id) {
    const amount = parseFloat(editValue) || 0;
    if (editRecurring) {
      await setBudget(id, amount, null);
      if (isOneTimeBudget(settings, id, key)) {
        const next = { ...settings.oneTimeBudgets };
        delete next[oneTimeBudgetKey(key, id)];
        await updateSettings({ oneTimeBudgets: next });
      }
    } else {
      await setBudget(id, amount, key);
    }
    setEditingId(null);
  }

  const sortedCategories = useMemo(
    () =>
      [...categories].sort(
        (a, b) => getEffectiveBudget(settings, b.id, key) - getEffectiveBudget(settings, a.id, key)
      ),
    [categories, settings, key]
  );

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
    <div id="budget-page" className="space-y-4">
      <PageHero
        id="budget-hero"
        tint="gold"
        eyebrow="Budget"
        title="Plan with intention"
        description="Set a monthly limit per category, then track how close you are as the month goes."
        image={illustrations.budget}
        aspect={HERO_ASPECT}
        edgeColor={illustrationEdgeColor.budget}
      >
        <button
          id="budget-export-button"
          onClick={handleExport}
          className="flex w-fit items-center gap-1.5 rounded-full bg-white text-[var(--accent-text)] text-sm font-bold px-4 py-2.5 hover:bg-white/90"
        >
          <Download size={16} /> Export to Excel
        </button>
      </PageHero>

      <Card id="budget-edit-form">
        <h3 className="font-semibold text-sm mb-3">Edit a budget</h3>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs text-ink/60 flex-1 min-w-[160px]">
            Category
            <select
              value={pickerCategoryId}
              onChange={(e) => setPickerCategoryId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-mist px-3 py-2 text-sm focus:outline-[var(--accent-ring)]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-ink/60 w-28">
            Amount
            <input
              type="number"
              step="0.01"
              min="0"
              value={pickerAmount}
              onChange={(e) => {
                setPickerAmount(e.target.value);
                setPickerSaved(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handlePickerSave()}
              className="mt-1 w-full rounded-lg border border-mist px-3 py-2 text-sm focus:outline-[var(--accent-ring)]"
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs text-ink/60 pb-2.5">
            <input
              type="checkbox"
              checked={pickerRecurring}
              onChange={(e) => {
                setPickerRecurring(e.target.checked);
                setPickerSaved(false);
              }}
            />
            Recurring (applies every month)
          </label>
          <button
            onClick={handlePickerSave}
            disabled={pickerSaving || !pickerCategoryId}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium px-4 py-2 hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {pickerSaved ? <Check size={15} /> : null}
            {pickerSaving ? "Saving…" : pickerSaved ? "Saved" : "Save"}
          </button>
        </div>
        {!pickerRecurring && (
          <p className="text-xs mt-2" style={{ color: "var(--accent-text)" }}>
            This will only apply to the currently viewed month ({key}) — other months keep the
            recurring amount.
          </p>
        )}
      </Card>

      <div
        id="budget-category-list"
        className="rounded-[1.75rem] shadow-soft border overflow-hidden"
        style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
      >
        <ul className="divide-y divide-mist">
        {sortedCategories.map((c) => {
          const budget = getEffectiveBudget(settings, c.id, key);
          const oneTime = isOneTimeBudget(settings, c.id, key);
          const spent = spentByCategory[c.id] || 0;
          const pct = budget > 0 ? (spent / budget) * 100 : 0;

          const atBudget = budget > 0 && Math.abs(spent - budget) < 0.005;

          // Severity now reads through shade intensity (darker = more urgent)
          // rather than a different hue per status, since every colored
          // element on a page renders as a shade of that page's one accent.
          let barColor = shadeCss(4);
          let overBudget = false;
          let statusText = "";
          if (budget === 0) {
            statusText = spent > 0 ? "No budget set for this category" : "";
          } else if (c.isFloorGoal) {
            if (atBudget) {
              barColor = shadeCss(5);
              statusText = "Right at goal";
            } else if (spent > budget) {
              barColor = shadeCss(5);
              statusText = `+${settings.currency}${(spent - budget).toLocaleString()} past goal`;
            } else {
              barColor = shadeCss(4);
              statusText = `${settings.currency}${(budget - spent).toLocaleString()} to goal`;
            }
          } else if (atBudget) {
            barColor = shadeCss(1);
            statusText = "Right at budget";
          } else if (pct > 100) {
            barColor = shadeCss(3);
            overBudget = true;
            statusText = `${settings.currency}${(spent - budget).toLocaleString()} over budget`;
          } else if (pct >= 80) {
            barColor = shadeCss(2);
            statusText = `${settings.currency}${(budget - spent).toLocaleString()} left`;
          } else {
            barColor = shadeCss(4);
            statusText = `${settings.currency}${(budget - spent).toLocaleString()} left`;
          }

          return (
            <BudgetCategoryRow
              key={c.id}
              category={c}
              index={categoryIndex(categories, c.id)}
              budget={budget}
              oneTime={oneTime}
              spent={spent}
              pct={pct}
              barColor={barColor}
              overBudget={overBudget}
              statusText={statusText}
              currency={settings.currency}
              isEditing={editingId === c.id}
              editValue={editValue}
              editRecurring={editRecurring}
              onStartEdit={() => startEdit(c)}
              onChangeEditValue={setEditValue}
              onChangeEditRecurring={setEditRecurring}
              onSaveEdit={() => saveEdit(c.id)}
            />
          );
        })}
      </ul>
      </div>
    </div>
  );
}
