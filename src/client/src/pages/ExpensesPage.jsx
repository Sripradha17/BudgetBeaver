import { useEffect, useMemo, useState } from "react";
import {
  Trash2,
  Plus,
  Pencil,
  X,
  Check,
  Search,
  AlertTriangle,
  Upload,
  Repeat,
  TrendingUp,
  TrendingDown,
  Scale,
  Receipt as ReceiptIcon,
  Wallet,
  MoreHorizontal,
} from "lucide-react";
import { useData } from "../context/DataContext.jsx";
import { useMonth } from "../context/MonthContext.jsx";
import { monthKey, toInputDate, fromInputDate } from "../lib/month.js";
import { findDuplicateGroups, expenseSignature } from "../lib/duplicates.js";
import { getMissingRecurringForMonth } from "../lib/recurring.js";
import { useUndoDelete } from "../hooks/useUndoDelete.js";
import { fetchExchangeRate, CURRENCIES } from "../lib/currency.js";
import Card from "../components/Card.jsx";
import EmptyState from "../components/EmptyState.jsx";
import PageHero from "../components/PageHero.jsx";
import { illustrations, illustrationAspect, HERO_ASPECT, illustrationEdgeColor } from "../assets/illustrations/index.js";
import CategoryChipPicker from "../components/CategoryChipPicker.jsx";
import StatTile from "../components/StatTile.jsx";
import ImportExpenses from "../components/ImportExpenses.jsx";
import DuplicateExpenses from "../components/DuplicateExpenses.jsx";
import Pagination from "../components/Pagination.jsx";
import UndoToast from "../components/UndoToast.jsx";

export default function ExpensesPage() {
  const {
    expenses,
    income,
    categories,
    settings,
    addExpense,
    bulkAddExpenses,
    updateExpense,
    removeExpense,
    updateSettings,
  } = useData();
  const { key } = useMonth();
  const [showImport, setShowImport] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPerson, setFilterPerson] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const PAGE_SIZE = 25;
  const [page, setPage] = useState(1);

  const [form, setForm] = useState({
    date: toInputDate(new Date()),
    category: categories[0]?.id || "",
    amount: "",
    note: "",
    person: "mine",
    isRecurring: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [addingRecurring, setAddingRecurring] = useState(false);
  const [foreignCurrency, setForeignCurrency] = useState(false);
  const [foreignCode, setForeignCode] = useState("INR");
  const [currencyError, setCurrencyError] = useState(null);

  const monthExpenses = useMemo(
    () => expenses.filter((e) => monthKey(new Date(e.date)) === key),
    [expenses, key]
  );

  const totals = useMemo(() => {
    const totalExpenses = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const totalIncome = income
      .filter((i) => monthKey(new Date(i.date)) === key)
      .reduce((s, i) => s + i.amount, 0);
    return { income: totalIncome, expenses: totalExpenses, diff: totalIncome - totalExpenses };
  }, [monthExpenses, income, key]);

  const visibleExpenses = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = monthExpenses.filter((e) => {
      if (filterCategory !== "all" && e.category !== filterCategory) return false;
      if (filterPerson !== "all" && (e.person || "mine") !== filterPerson) return false;
      if (q && !(e.note || "").toLowerCase().includes(q)) return false;
      return true;
    });
    const sorters = {
      "date-desc": (a, b) => new Date(b.date) - new Date(a.date),
      "date-asc": (a, b) => new Date(a.date) - new Date(b.date),
      "amount-desc": (a, b) => b.amount - a.amount,
      "amount-asc": (a, b) => a.amount - b.amount,
    };
    return rows.sort(sorters[sortBy]);
  }, [monthExpenses, search, filterCategory, filterPerson, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [key, search, filterCategory, filterPerson, sortBy]);

  const pagedExpenses = visibleExpenses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Group into day sections when sorted chronologically — reads like a real transaction
  // feed instead of repeating the same date on every row. Amount-sorted views stay flat
  // since a day grouping wouldn't be contiguous there.
  const dayGroups = useMemo(() => {
    if (sortBy !== "date-desc" && sortBy !== "date-asc") return null;
    const groups = [];
    let current = null;
    for (const e of pagedExpenses) {
      const dayKey = toInputDate(e.date);
      if (!current || current.dayKey !== dayKey) {
        current = { dayKey, date: e.date, rows: [], total: 0 };
        groups.push(current);
      }
      current.rows.push(e);
      current.total += e.amount;
    }
    return groups;
  }, [pagedExpenses, sortBy]);

  const ignoredDuplicateSignatures = useMemo(
    () => new Set(settings.ignoredDuplicateSignatures || []),
    [settings.ignoredDuplicateSignatures]
  );
  const duplicateGroups = useMemo(
    () => findDuplicateGroups(expenses, ignoredDuplicateSignatures),
    [expenses, ignoredDuplicateSignatures]
  );

  async function handleKeepDuplicateGroup(group) {
    const sig = expenseSignature(group[0].date, group[0].amount, group[0].note);
    const next = [...(settings.ignoredDuplicateSignatures || []), sig];
    await updateSettings({ ignoredDuplicateSignatures: next });
  }

  const dismissedRecurringMonths = settings.dismissedRecurringMonths || [];
  const missingRecurring = useMemo(
    () => (dismissedRecurringMonths.includes(key) ? [] : getMissingRecurringForMonth(expenses, key)),
    [expenses, key, dismissedRecurringMonths]
  );

  const {
    pending: pendingDelete,
    deleteWithUndo,
    undo: undoDelete,
    dismiss: dismissUndo,
  } = useUndoDelete({
    onDelete: (expense) => removeExpense(expense._id),
    onRestore: (expense) =>
      addExpense({
        date: expense.date,
        category: expense.category,
        amount: expense.amount,
        note: expense.note,
        person: expense.person,
        isRecurring: expense.isRecurring,
      }),
  });

  function handleDeleteExpense(expense) {
    const label = expense.note || categoryById[expense.category]?.label || "Expense";
    deleteWithUndo(expense, `"${label}" deleted`);
  }

  async function handleAddAllRecurring() {
    setAddingRecurring(true);
    try {
      await bulkAddExpenses(missingRecurring);
    } finally {
      setAddingRecurring(false);
    }
  }

  async function handleDismissRecurring() {
    await updateSettings({ dismissedRecurringMonths: [...dismissedRecurringMonths, key] });
  }

  const categoryById = useMemo(() => {
    const map = {};
    categories.forEach((c) => (map[c.id] = c));
    return map;
  }, [categories]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.amount || !form.category) return;
    setSubmitting(true);
    setCurrencyError(null);
    try {
      const foreignAmount = parseFloat(form.amount);
      let baseAmount = foreignAmount;
      let payloadForeignCurrency;
      let payloadForeignAmount;
      if (foreignCurrency && foreignCode !== settings.baseCurrencyCode) {
        const rate = await fetchExchangeRate(foreignCode, settings.baseCurrencyCode);
        baseAmount = foreignAmount * rate;
        payloadForeignCurrency = foreignCode;
        payloadForeignAmount = foreignAmount;
      }
      await addExpense({
        date: fromInputDate(form.date),
        category: form.category,
        amount: baseAmount,
        note: form.note,
        person: form.person,
        isRecurring: form.isRecurring,
        foreignCurrency: payloadForeignCurrency,
        foreignAmount: payloadForeignAmount,
      });
      setForm((f) => ({ ...f, amount: "", note: "", isRecurring: false }));
    } catch (err) {
      setCurrencyError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(e) {
    setEditingId(e._id);
    setEditForm({
      date: toInputDate(e.date),
      category: e.category,
      amount: String(e.amount),
      note: e.note || "",
      person: e.person || "mine",
      isRecurring: !!e.isRecurring,
    });
  }

  async function saveEdit(id) {
    await updateExpense(id, {
      date: fromInputDate(editForm.date),
      category: editForm.category,
      amount: parseFloat(editForm.amount) || 0,
      note: editForm.note,
      person: editForm.person,
      isRecurring: editForm.isRecurring,
    });
    setEditingId(null);
    setEditForm(null);
  }

  const fmt = (n) => `${settings.currency}${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  return (
    <div id="expenses-page" className="space-y-5">
      <PageHero
        id="expenses-hero"
        tint="coral"
        eyebrow="Expenses"
        title="Track every dollar"
        description="Log it in a few seconds — the beaver keeps a running tally, categorized and ready to export."
        image={illustrations.expenses}
        aspect={HERO_ASPECT}
        edgeColor={illustrationEdgeColor.expenses}
      />

      <div id="expenses-stat-tiles" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatTile label="Income" value={fmt(totals.income)} icon={TrendingUp} tone="accent" />
        <StatTile label="Expenses" value={fmt(totals.expenses)} icon={TrendingDown} tone="accent" />
        <StatTile
          label="Difference"
          value={`${totals.diff < 0 ? "-" : ""}${fmt(Math.abs(totals.diff))}`}
          icon={Scale}
          tone="accent"
          className="col-span-2 sm:col-span-1"
        />
      </div>

      <Card id="expenses-add-form">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="font-bold text-lg flex items-center gap-1.5">
              <Wallet size={18} className="text-[var(--accent-text)]" /> What did you spend?
            </h2>
            <p className="text-xs text-ink/45 mt-0.5">Pick a category, enter the amount, done.</p>
          </div>
          <div className="flex items-center gap-3">
            {duplicateGroups.length > 0 && (
              <button
                onClick={() => setShowDuplicates(true)}
                className="flex items-center gap-1 text-sm text-amber-600 font-medium hover:underline"
              >
                <AlertTriangle size={14} />
                {duplicateGroups.length} possible duplicate{duplicateGroups.length !== 1 ? "s" : ""}
              </button>
            )}
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium px-3 py-2 hover:bg-[var(--accent-hover)]"
            >
              <Upload size={15} /> Import from Excel/CSV
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-[1.3fr_1fr] gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink/45">
                Amount
              </span>
              <div className="flex items-center gap-2 rounded-2xl border-2 border-mist bg-white/85 px-4 py-2 focus-within:border-[var(--accent)] transition-colors">
                <span className="text-2xl font-display font-extrabold text-ink/25">{settings.currency}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="min-w-0 flex-1 bg-transparent font-display text-2xl font-extrabold text-ink outline-none placeholder:text-ink/20"
                  required
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink/45">
                Date
              </span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="h-[54px] w-full rounded-2xl border-2 border-mist bg-white/85 px-4 text-sm focus:border-[var(--accent)] focus:outline-none"
                required
              />
            </label>
          </div>

          <div>
            <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink/45">
              Category
            </span>
            <CategoryChipPicker
              categories={categories}
              value={form.category}
              onChange={(id) => setForm((f) => ({ ...f, category: id }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink/45">
                Note
              </span>
              <input
                type="text"
                placeholder="What was it for? (optional)"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                className="w-full rounded-2xl border-2 border-mist bg-white/85 px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink/45">
                Paid by
              </span>
              <select
                value={form.person}
                onChange={(e) => setForm((f) => ({ ...f, person: e.target.value }))}
                className="h-[46px] w-full rounded-2xl border-2 border-mist bg-white/85 px-4 text-sm focus:border-[var(--accent)] focus:outline-none"
              >
                <option value="mine">{settings.myLabel}</option>
                <option value="spouse">{settings.spouseLabel}</option>
              </select>
            </label>
          </div>

          <label className="flex items-center gap-1.5 text-xs text-ink/60">
            <input
              type="checkbox"
              checked={form.isRecurring}
              onChange={(e) => setForm((f) => ({ ...f, isRecurring: e.target.checked }))}
            />
            <Repeat size={12} /> Repeats every month (same amount, same day) — I'll prompt you to add it in future months
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="flex items-center gap-1.5 text-xs text-ink/60">
              <input
                type="checkbox"
                checked={foreignCurrency}
                onChange={(e) => setForeignCurrency(e.target.checked)}
              />
              Paid in a different currency
            </label>
            {foreignCurrency && (
              <select
                value={foreignCode}
                onChange={(e) => setForeignCode(e.target.value)}
                className="rounded border border-mist px-2 py-1 text-xs"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>
          {currencyError && <p className="text-xs text-red-400">{currencyError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-[linear-gradient(90deg,var(--accent),var(--accent-hover))] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-white shadow-[0_18px_28px_-20px_color-mix(in_srgb,var(--accent)_70%,transparent)] hover:opacity-95 disabled:opacity-50 sm:w-auto"
          >
            <Plus size={16} /> {submitting ? "Adding…" : "Add expense"}
          </button>
        </form>
      </Card>

      {missingRecurring.length > 0 && (
        <Card id="expenses-missing-recurring" className="border-[color-mix(in_srgb,var(--accent)_40%,transparent)]" style={{ backgroundColor: "var(--tile-bg)" }}>
          <div className="flex items-start gap-3">
            <Repeat size={18} className="text-[var(--accent-text)] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink">
                {missingRecurring.length} recurring transaction{missingRecurring.length !== 1 ? "s" : ""} look
                missing this month
              </p>
              <p className="text-xs text-ink/60 mt-0.5">
                {missingRecurring.map((m) => `${m.note || categoryById[m.category]?.label} (${settings.currency}${m.amount.toLocaleString()})`).join(", ")}
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleAddAllRecurring}
                  disabled={addingRecurring}
                  className="rounded-lg bg-[var(--accent)] text-white text-xs font-medium px-3 py-1.5 hover:bg-[var(--accent-hover)] disabled:opacity-50"
                >
                  {addingRecurring ? "Adding…" : `Add all ${missingRecurring.length}`}
                </button>
                <button
                  onClick={handleDismissRecurring}
                  className="rounded-lg border border-mist text-xs font-medium px-3 py-1.5 hover:bg-mist/40"
                >
                  Not this month
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card id="expenses-list">
        <h2 className="font-bold text-lg mb-3">This month's expenses</h2>

        {monthExpenses.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 mb-3">
            <div className="relative sm:flex-1 sm:min-w-[160px]">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/30" />
              <input
                type="text"
                placeholder="Search notes…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-mist pl-8 pr-3 py-1.5 text-sm focus:outline-[var(--accent-ring)]"
              />
            </div>
            <div className="grid grid-cols-2 sm:flex gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-lg border border-mist px-2 py-1.5 text-sm"
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <select
                value={filterPerson}
                onChange={(e) => setFilterPerson(e.target.value)}
                className="rounded-lg border border-mist px-2 py-1.5 text-sm"
              >
                <option value="all">Everyone</option>
                <option value="mine">{settings.myLabel}</option>
                <option value="spouse">{settings.spouseLabel}</option>
              </select>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-mist px-2 py-1.5 text-sm"
            >
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="amount-desc">Amount: high to low</option>
              <option value="amount-asc">Amount: low to high</option>
            </select>
          </div>
        )}

        {monthExpenses.length === 0 ? (
          <EmptyState
            image={illustrations.expensesEmpty}
            aspect={illustrationAspect.expensesEmpty}
            tint="coral"
            message="No expenses logged yet — add one above to get started."
          />
        ) : visibleExpenses.length === 0 ? (
          <p className="text-ink/50 text-sm py-6 text-center">No expenses match your search/filters.</p>
        ) : dayGroups ? (
          <div className="space-y-4">
            {dayGroups.map((group) => (
              <div key={group.dayKey}>
                <div className="flex items-center justify-between px-1 mb-1.5 pb-1 border-b border-dashed border-mist">
                  <span className="text-xs font-semibold text-ink/50 uppercase tracking-wide flex items-center gap-1.5">
                    <ReceiptIcon size={12} className="text-ink/30" />
                    {new Date(group.date).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-xs font-semibold text-ink/50 tabular-nums">
                    {settings.currency}
                    {group.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <ul className="rounded-xl border border-mist/70 divide-y divide-mist overflow-hidden">
                  {group.rows.map((e) =>
                    editingId === e._id ? (
                      <EditRow
                        key={e._id}
                        editForm={editForm}
                        setEditForm={setEditForm}
                        categories={categories}
                        settings={settings}
                        onSave={() => saveEdit(e._id)}
                        onCancel={() => {
                          setEditingId(null);
                          setEditForm(null);
                        }}
                      />
                    ) : (
                      <ExpenseRow
                        key={e._id}
                        expense={e}
                        category={categoryById[e.category]}
                        settings={settings}
                        onEdit={() => startEdit(e)}
                        onDelete={() => handleDeleteExpense(e)}
                      />
                    )
                  )}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <ul className="rounded-xl border border-mist/70 divide-y divide-mist overflow-hidden">
            {pagedExpenses.map((e) =>
              editingId === e._id ? (
                <EditRow
                  key={e._id}
                  editForm={editForm}
                  setEditForm={setEditForm}
                  categories={categories}
                  settings={settings}
                  onSave={() => saveEdit(e._id)}
                  onCancel={() => {
                    setEditingId(null);
                    setEditForm(null);
                  }}
                />
              ) : (
                <ExpenseRow
                  key={e._id}
                  expense={e}
                  category={categoryById[e.category]}
                  settings={settings}
                  showDate
                  onEdit={() => startEdit(e)}
                  onDelete={() => handleDeleteExpense(e)}
                />
              )
            )}
          </ul>
        )}

        <Pagination page={page} pageSize={PAGE_SIZE} total={visibleExpenses.length} onPageChange={setPage} />
      </Card>

      {showImport && <ImportExpenses onClose={() => setShowImport(false)} />}
      {showDuplicates && (
        <DuplicateExpenses
          groups={duplicateGroups}
          categories={categories}
          settings={settings}
          removeExpense={removeExpense}
          onKeepGroup={handleKeepDuplicateGroup}
          onClose={() => setShowDuplicates(false)}
        />
      )}
      {pendingDelete && (
        <UndoToast message={pendingDelete.label} onUndo={undoDelete} onDismiss={dismissUndo} />
      )}
    </div>
  );
}

function ExpenseRow({ expense: e, category, settings, showDate, onEdit, onDelete }) {
  const Icon = category?.icon || MoreHorizontal;
  const color = category?.badgeColor || "#7d8590";
  return (
    <li className="relative flex items-center gap-3 py-2.5 pl-3 pr-3 hover:bg-mist/40 transition-colors duration-150 group">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}22`, color }}
      >
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink truncate flex items-center gap-1.5">
          {e.note || category?.label || "Expense"}
          {e.isRecurring && (
            <Repeat size={11} className="text-[var(--accent-text)] shrink-0" aria-label="Recurring" />
          )}
        </p>
        <p className="text-xs text-ink/50 truncate">
          {category?.label}
          {showDate && (
            <>
              {" · "}
              {new Date(e.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </>
          )}
          {" · "}
          {e.person === "spouse" ? settings.spouseLabel : settings.myLabel}
          {e.foreignCurrency && (
            <>
              {" · "}
              {e.foreignAmount} {e.foreignCurrency}
            </>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-display font-bold text-sm tabular-nums text-[var(--accent-text)]">
          −{settings.currency}
          {e.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
        <button
          onClick={onEdit}
          className="text-ink/20 group-hover:text-ink/40 hover:!text-plum transition"
          aria-label="Edit expense"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={onDelete}
          className="text-ink/20 group-hover:text-ink/40 hover:!text-red-500 transition"
          aria-label="Delete expense"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </li>
  );
}

function EditRow({ editForm, setEditForm, categories, settings, onSave, onCancel }) {
  return (
    <li className="py-2.5 px-3">
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        <input
          type="date"
          value={editForm.date}
          onChange={(ev) => setEditForm((f) => ({ ...f, date: ev.target.value }))}
          className="col-span-2 sm:col-span-1 rounded border border-mist px-2 py-1.5 text-xs"
        />
        <select
          value={editForm.category}
          onChange={(ev) => setEditForm((f) => ({ ...f, category: ev.target.value }))}
          className="col-span-1 rounded border border-mist px-2 py-1.5 text-xs"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={editForm.person}
          onChange={(ev) => setEditForm((f) => ({ ...f, person: ev.target.value }))}
          className="col-span-1 rounded border border-mist px-2 py-1.5 text-xs"
        >
          <option value="mine">{settings.myLabel}</option>
          <option value="spouse">{settings.spouseLabel}</option>
        </select>
        <input
          type="number"
          step="0.01"
          value={editForm.amount}
          onChange={(ev) => setEditForm((f) => ({ ...f, amount: ev.target.value }))}
          className="col-span-1 rounded border border-mist px-2 py-1.5 text-xs"
        />
        <input
          type="text"
          placeholder="Note"
          value={editForm.note}
          onChange={(ev) => setEditForm((f) => ({ ...f, note: ev.target.value }))}
          className="col-span-1 rounded border border-mist px-2 py-1.5 text-xs"
        />
        <div className="col-span-2 sm:col-span-1 flex items-center gap-2">
          <button
            onClick={onSave}
            className="flex items-center justify-center rounded bg-[var(--accent)] text-white p-1.5 hover:bg-[var(--accent-hover)]"
            aria-label="Save"
          >
            <Check size={14} />
          </button>
          <button
            onClick={onCancel}
            className="flex items-center justify-center rounded border border-mist p-1.5 hover:bg-mist/40"
            aria-label="Cancel"
          >
            <X size={14} />
          </button>
        </div>
        <label className="col-span-2 sm:col-span-6 flex items-center gap-1.5 text-xs text-ink/60">
          <input
            type="checkbox"
            checked={!!editForm.isRecurring}
            onChange={(ev) => setEditForm((f) => ({ ...f, isRecurring: ev.target.checked }))}
          />
          <Repeat size={11} /> Repeats every month
        </label>
      </div>
    </li>
  );
}
