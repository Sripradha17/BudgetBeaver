import { useRef, useState } from "react";
import { X, Upload, CheckCircle2, PlusCircle, Pencil, Trash2, Check, AlertTriangle } from "lucide-react";
import { useData } from "../context/DataContext.jsx";
import { parseImportFile, suggestCategoryFor } from "../lib/importExcel.js";
import { toInputDate, fromInputDate } from "../lib/month.js";
import { oneTimeBudgetKey } from "../lib/budgets.js";
import { expenseSignature } from "../lib/duplicates.js";
import Pagination from "./Pagination.jsx";

const NEW_PREFIX = "new:";
const ROWS_PAGE_SIZE = 25;

export default function ImportExpenses({ onClose }) {
  const {
    expenses,
    categories,
    customCategories,
    settings,
    addCategory,
    bulkAddExpenses,
    bulkAddIncome,
    updateExpense,
    removeExpense,
    updateSettings,
  } = useData();
  const [parsed, setParsed] = useState(null);
  const [importing, setImporting] = useState(false);
  const importingRef = useRef(false); // synchronous guard against double-click double-submit
  const [fileName, setFileName] = useState("");
  const [importedExpenses, setImportedExpenses] = useState(null); // set once import completes
  const [duplicateKeys, setDuplicateKeys] = useState(() => new Set());

  // Per-row editable state, keyed by row.key
  const [expenseState, setExpenseState] = useState({});
  const [incomeState, setIncomeState] = useState({});
  const [budgetState, setBudgetState] = useState({});

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const result = await parseImportFile(file, categories, settings);
    setParsed(result);

    // Flag rows that look like they're already in the database (or repeated within
    // this same file) so a re-import of the same sheet doesn't silently double everything.
    const seen = new Set(expenses.map((e) => expenseSignature(e.date, e.amount, e.note)));
    const dupKeys = new Set();

    if (result.template) {
      const nextExpense = {};
      result.expenseRows.forEach((r) => {
        const sig = r.valid ? expenseSignature(r.date, r.amount, r.note) : null;
        const isDup = sig !== null && seen.has(sig);
        if (isDup) dupKeys.add(r.key);
        if (sig !== null) seen.add(sig);
        nextExpense[r.key] = {
          include: r.valid && !isDup,
          category: r.category || `${NEW_PREFIX}${r.rawCategoryText || "Others"}`,
          person: r.person || "mine",
        };
      });
      setExpenseState(nextExpense);

      const nextIncome = {};
      result.incomeRows.forEach((r) => {
        nextIncome[r.key] = { include: r.valid, person: r.person || "spouse" };
      });
      setIncomeState(nextIncome);

      const nextBudget = {};
      result.budgetRows.forEach((r) => {
        nextBudget[r.key] = {
          include: true,
          category: r.category || `${NEW_PREFIX}${r.categoryText}`,
          recurring: true,
        };
      });
      setBudgetState(nextBudget);
    } else {
      const nextExpense = {};
      result.rows.forEach((r) => {
        const sig = r.valid ? expenseSignature(r.date, r.amount, r.note) : null;
        const isDup = sig !== null && seen.has(sig);
        if (isDup) dupKeys.add(r.key);
        if (sig !== null) seen.add(sig);
        nextExpense[r.key] = {
          include: r.valid && !isDup,
          category: r.category,
          person: r.person || "mine",
        };
      });
      setExpenseState(nextExpense);
    }
    setDuplicateKeys(dupKeys);
  }

  const includedExpenseCount = Object.values(expenseState).filter((s) => s.include).length;
  const includedIncomeCount = Object.values(incomeState).filter((s) => s.include).length;
  const includedBudgetCount = Object.values(budgetState).filter((s) => s.include).length;

  async function handleImport() {
    if (importingRef.current) return; // rapid double-click guard — state alone can lag a render behind
    importingRef.current = true;
    setImporting(true);
    try {
      if (!parsed.template) {
        const rows = parsed.rows.filter((r) => expenseState[r.key]?.include && r.valid);
        let created = [];
        if (rows.length > 0) {
          created = await bulkAddExpenses(
            rows.map((r) => ({
              date: r.date,
              category: expenseState[r.key].category,
              amount: r.amount,
              note: r.note,
              person: expenseState[r.key].person,
            }))
          );
        }
        setImportedExpenses(created);
        return;
      }

      // Resolve every "+ New category" selection to a real category, creating each
      // distinct one exactly once.
      const newCategoryTexts = new Set();
      Object.values(expenseState).forEach((s) => {
        if (s.include && s.category?.startsWith(NEW_PREFIX)) {
          newCategoryTexts.add(s.category.slice(NEW_PREFIX.length));
        }
      });
      Object.values(budgetState).forEach((s) => {
        if (s.include && s.category?.startsWith(NEW_PREFIX)) {
          newCategoryTexts.add(s.category.slice(NEW_PREFIX.length));
        }
      });

      // A suggested slug can collide with an existing category (e.g. a blank category
      // text falling back to "Others", which slugifies to the built-in "others") or with
      // another new one created earlier in this same loop — reuse the id instead of
      // inserting a second category document with the same id.
      const createdIdByText = {};
      const claimedIds = new Set(categories.map((c) => c.id));
      let count = customCategories.length;
      for (const text of newCategoryTexts) {
        const suggestion = suggestCategoryFor(text, count);
        if (claimedIds.has(suggestion.id)) {
          createdIdByText[text] = suggestion.id;
          continue;
        }
        count++;
        claimedIds.add(suggestion.id);
        await addCategory(suggestion);
        createdIdByText[text] = suggestion.id;
      }

      const resolveCategory = (value) =>
        value.startsWith(NEW_PREFIX) ? createdIdByText[value.slice(NEW_PREFIX.length)] : value;

      const expenseRows = parsed.expenseRows.filter(
        (r) => r.valid && expenseState[r.key]?.include
      );
      let createdExpenses = [];
      if (expenseRows.length > 0) {
        createdExpenses = await bulkAddExpenses(
          expenseRows.map((r) => ({
            date: r.date,
            category: resolveCategory(expenseState[r.key].category),
            amount: r.amount,
            note: r.note,
            person: expenseState[r.key].person,
          }))
        );
      }

      const incomeRows = parsed.incomeRows.filter((r) => r.valid && incomeState[r.key]?.include);
      if (incomeRows.length > 0) {
        await bulkAddIncome(
          incomeRows.map((r) => ({
            date: r.date,
            amount: r.amount,
            person: incomeState[r.key].person,
            note: r.note,
          }))
        );
      }

      const budgetRows = parsed.budgetRows.filter((r) => budgetState[r.key]?.include);
      if (budgetRows.length > 0) {
        const nextBudgets = { ...settings.budgets };
        const nextOneTime = { ...settings.oneTimeBudgets };
        budgetRows.forEach((r) => {
          const s = budgetState[r.key];
          const categoryId = resolveCategory(s.category);
          if (s.recurring || !r.monthKey) {
            nextBudgets[categoryId] = r.planned;
          } else {
            nextOneTime[oneTimeBudgetKey(r.monthKey, categoryId)] = r.planned;
          }
        });
        await updateSettings({ budgets: nextBudgets, oneTimeBudgets: nextOneTime });
      }

      setImportedExpenses(createdExpenses);
    } finally {
      importingRef.current = false;
      setImporting(false);
    }
  }

  const categoryOptionsFor = (rawText) => (
    <>
      <option value={`${NEW_PREFIX}${rawText || "Others"}`}>
        + New category: "{rawText || "Others"}"
      </option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.label}
        </option>
      ))}
    </>
  );

  const showingReview = importedExpenses !== null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-backdrop-in">
      <div className="bg-surface rounded-2xl shadow-soft w-full max-w-4xl max-h-[85vh] flex flex-col animate-modal-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-mist">
          <h2 className="font-bold text-lg">
            {showingReview ? "Review imported expenses" : "Import from Excel/CSV"}
          </h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {showingReview && (
            <ImportedExpensesReview
              expenses={importedExpenses}
              categories={categories}
              settings={settings}
              updateExpense={updateExpense}
              removeExpense={removeExpense}
              onRemoveFromList={(id) =>
                setImportedExpenses((prev) => prev.filter((e) => e._id !== id))
              }
              onUpdateInList={(id, updated) =>
                setImportedExpenses((prev) => prev.map((e) => (e._id === id ? updated : e)))
              }
            />
          )}

          {!showingReview && !parsed && (
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-mist rounded-xl py-12 cursor-pointer hover:border-[var(--accent)] transition">
              <Upload size={28} className="text-ink/40" />
              <span className="text-sm text-ink/60">
                Click to choose an .xlsx, .xls, or .csv file
              </span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFile}
              />
            </label>
          )}

          {!showingReview && parsed && !parsed.template && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink/60">{fileName}</span>
                <span className="flex items-center gap-1.5 text-teal font-medium">
                  <CheckCircle2 size={15} />
                  {parsed.parsedCount} parsed, {parsed.skippedCount} skipped
                </span>
              </div>
              {duplicateKeys.size > 0 && (
                <DuplicateBanner count={duplicateKeys.size} />
              )}
              <ExpenseTable
                rows={parsed.rows}
                state={expenseState}
                setState={setExpenseState}
                settings={settings}
                showMonth={false}
                duplicateKeys={duplicateKeys}
              />
            </>
          )}

          {!showingReview && parsed && parsed.template && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink/60">{fileName}</span>
                <span className="flex items-center gap-1.5 text-teal font-medium">
                  <CheckCircle2 size={15} />
                  Detected {parsed.months.length} month{parsed.months.length !== 1 ? "s" : ""}:{" "}
                  {parsed.months.join(", ")}
                </span>
              </div>

              <Section title={`Expenses (${includedExpenseCount} selected)`}>
                {duplicateKeys.size > 0 && <DuplicateBanner count={duplicateKeys.size} />}
                <ExpenseTable
                  rows={parsed.expenseRows}
                  state={expenseState}
                  setState={setExpenseState}
                  settings={settings}
                  showMonth
                  categoryOptionsFor={categoryOptionsFor}
                  duplicateKeys={duplicateKeys}
                />
              </Section>

              <Section title={`Income (${includedIncomeCount} selected)`}>
                <IncomeTable
                  rows={parsed.incomeRows}
                  state={incomeState}
                  setState={setIncomeState}
                  settings={settings}
                />
              </Section>

              <Section
                title={`Category budgets (${includedBudgetCount} selected)`}
                hint="Read from each month's Summary sheet. Later months win when the same category appears more than once."
              >
                <BudgetTable
                  rows={parsed.budgetRows}
                  state={budgetState}
                  setState={setBudgetState}
                  categories={categories}
                  settings={settings}
                  categoryOptionsFor={categoryOptionsFor}
                />
              </Section>
            </>
          )}
        </div>

        {!showingReview && parsed && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-mist">
            <span className="text-sm text-ink/60">
              {parsed.template
                ? `${includedExpenseCount} expenses, ${includedIncomeCount} income, ${includedBudgetCount} budgets selected`
                : `${includedExpenseCount} rows selected`}
            </span>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="rounded-lg border border-mist text-sm font-medium px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={
                  importing ||
                  (includedExpenseCount === 0 && includedIncomeCount === 0 && includedBudgetCount === 0)
                }
                className="rounded-lg bg-[var(--accent)] text-white text-sm font-medium px-4 py-2 hover:bg-[var(--accent-hover)] disabled:opacity-50"
              >
                {importing ? "Importing…" : "Import"}
              </button>
            </div>
          </div>
        )}

        {showingReview && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-mist">
            <span className="text-sm text-ink/60">{importedExpenses.length} expenses imported</span>
            <button
              onClick={onClose}
              className="rounded-lg bg-[var(--accent)] text-white text-sm font-medium px-4 py-2 hover:bg-[var(--accent-hover)]"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, hint, children }) {
  return (
    <div>
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      {hint && <p className="text-xs text-ink/50 mb-2">{hint}</p>}
      {children}
    </div>
  );
}

function DuplicateBanner({ count }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-amber-600 mb-2">
      <AlertTriangle size={13} />
      {count} row{count !== 1 ? "s" : ""} match an expense you already have (same date, amount,
      and note) — unchecked by default. Re-check any that aren't actually duplicates.
    </p>
  );
}

function ExpenseTable({ rows, state, setState, settings, showMonth, categoryOptionsFor, duplicateKeys }) {
  const [page, setPage] = useState(1);
  if (rows.length === 0) return <p className="text-ink/50 text-sm py-4 text-center">No rows found.</p>;

  function toggle(key) {
    setState((prev) => ({ ...prev, [key]: { ...prev[key], include: !prev[key]?.include } }));
  }
  function setCategory(key, category) {
    setState((prev) => ({ ...prev, [key]: { ...prev[key], category } }));
  }
  function setPerson(key, person) {
    setState((prev) => ({ ...prev, [key]: { ...prev[key], person } }));
  }

  const pageRows = rows.slice((page - 1) * ROWS_PAGE_SIZE, page * ROWS_PAGE_SIZE);

  return (
    <div>
    <div className="overflow-x-auto scroll-fade-x">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-ink/50 border-b border-mist">
            <th className="py-2 pr-2 w-8"></th>
            {showMonth && <th className="py-2 pr-2">Month</th>}
            <th className="py-2 pr-2">Date</th>
            <th className="py-2 pr-2">Category</th>
            <th className="py-2 pr-2">Person</th>
            <th className="py-2 pr-2">Amount</th>
            <th className="py-2 pr-2">Note</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map((r) => {
            const s = state[r.key] || {};
            const isDup = duplicateKeys?.has(r.key);
            return (
              <tr
                key={r.key}
                className={`border-b border-mist/60 ${!r.valid ? "opacity-40" : ""} ${
                  isDup ? "bg-amber-500/10" : ""
                }`}
              >
                <td className="py-1.5 pr-2">
                  <input
                    type="checkbox"
                    checked={!!s.include}
                    disabled={!r.valid}
                    onChange={() => toggle(r.key)}
                    title={isDup ? "Looks like a duplicate of an existing expense" : undefined}
                  />
                </td>
                {showMonth && <td className="py-1.5 pr-2 whitespace-nowrap">{r.month}</td>}
                <td className="py-1.5 pr-2 whitespace-nowrap">
                  {r.date ? toInputDate(r.date) : "—"}
                </td>
                <td className="py-1.5 pr-2">
                  {categoryOptionsFor ? (
                    <select
                      value={s.category || ""}
                      onChange={(e) => setCategory(r.key, e.target.value)}
                      disabled={!r.valid}
                      className="rounded border border-mist px-1.5 py-1 text-xs max-w-[180px]"
                    >
                      {categoryOptionsFor(r.rawCategoryText)}
                    </select>
                  ) : (
                    r.category
                  )}
                </td>
                <td className="py-1.5 pr-2">
                  <select
                    value={s.person || "mine"}
                    onChange={(e) => setPerson(r.key, e.target.value)}
                    disabled={!r.valid}
                    className={`rounded border px-1.5 py-1 text-xs ${
                      r.person ? "border-mist" : "border-amber-400"
                    }`}
                  >
                    <option value="mine">{settings.myLabel}</option>
                    <option value="spouse">{settings.spouseLabel}</option>
                  </select>
                </td>
                <td className="py-1.5 pr-2">{r.amount === "" ? "—" : r.amount}</td>
                <td className="py-1.5 pr-2 truncate max-w-[160px]">{r.note}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    <Pagination page={page} pageSize={ROWS_PAGE_SIZE} total={rows.length} onPageChange={setPage} />
    </div>
  );
}

function IncomeTable({ rows, state, setState, settings }) {
  const [page, setPage] = useState(1);
  if (rows.length === 0) return <p className="text-ink/50 text-sm py-4 text-center">No income rows found.</p>;

  function toggle(key) {
    setState((prev) => ({ ...prev, [key]: { ...prev[key], include: !prev[key]?.include } }));
  }
  function setPerson(key, person) {
    setState((prev) => ({ ...prev, [key]: { ...prev[key], person } }));
  }

  const pageRows = rows.slice((page - 1) * ROWS_PAGE_SIZE, page * ROWS_PAGE_SIZE);

  return (
    <div>
    <div className="overflow-x-auto scroll-fade-x">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-ink/50 border-b border-mist">
            <th className="py-2 pr-2 w-8"></th>
            <th className="py-2 pr-2">Month</th>
            <th className="py-2 pr-2">Date</th>
            <th className="py-2 pr-2">Person</th>
            <th className="py-2 pr-2">Amount</th>
            <th className="py-2 pr-2">Note</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map((r) => {
            const s = state[r.key] || {};
            return (
              <tr key={r.key} className={`border-b border-mist/60 ${!r.valid ? "opacity-40" : ""}`}>
                <td className="py-1.5 pr-2">
                  <input
                    type="checkbox"
                    checked={!!s.include}
                    disabled={!r.valid}
                    onChange={() => toggle(r.key)}
                  />
                </td>
                <td className="py-1.5 pr-2 whitespace-nowrap">{r.month}</td>
                <td className="py-1.5 pr-2 whitespace-nowrap">
                  {r.date ? toInputDate(r.date) : "—"}
                </td>
                <td className="py-1.5 pr-2">
                  <select
                    value={s.person || "spouse"}
                    onChange={(e) => setPerson(r.key, e.target.value)}
                    disabled={!r.valid}
                    className={`rounded border px-1.5 py-1 text-xs ${
                      r.person ? "border-mist" : "border-amber-400"
                    }`}
                  >
                    <option value="mine">{settings.myLabel}</option>
                    <option value="spouse">{settings.spouseLabel}</option>
                  </select>
                </td>
                <td className="py-1.5 pr-2">{r.amount === "" ? "—" : r.amount}</td>
                <td className="py-1.5 pr-2 truncate max-w-[160px]">{r.note}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    <Pagination page={page} pageSize={ROWS_PAGE_SIZE} total={rows.length} onPageChange={setPage} />
    </div>
  );
}

function BudgetTable({ rows, state, setState, settings, categoryOptionsFor }) {
  const [page, setPage] = useState(1);
  if (rows.length === 0)
    return <p className="text-ink/50 text-sm py-4 text-center">No budget data found.</p>;

  function toggle(key) {
    setState((prev) => ({ ...prev, [key]: { ...prev[key], include: !prev[key]?.include } }));
  }
  function setCategory(key, category) {
    setState((prev) => ({ ...prev, [key]: { ...prev[key], category } }));
  }
  function setRecurring(key, recurring) {
    setState((prev) => ({ ...prev, [key]: { ...prev[key], recurring } }));
  }

  const pageRows = rows.slice((page - 1) * ROWS_PAGE_SIZE, page * ROWS_PAGE_SIZE);

  return (
    <div>
    <div className="overflow-x-auto scroll-fade-x">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-ink/50 border-b border-mist">
            <th className="py-2 pr-2 w-8"></th>
            <th className="py-2 pr-2">Sheet category</th>
            <th className="py-2 pr-2">Maps to</th>
            <th className="py-2 pr-2">Planned/mo</th>
            <th className="py-2 pr-2">Recurring?</th>
            <th className="py-2 pr-2">From</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map((r) => {
            const s = state[r.key] || {};
            return (
              <tr key={r.key} className="border-b border-mist/60">
                <td className="py-1.5 pr-2">
                  <input type="checkbox" checked={!!s.include} onChange={() => toggle(r.key)} />
                </td>
                <td className="py-1.5 pr-2 flex items-center gap-1">
                  {!r.category && <PlusCircle size={13} className="text-amber-500 shrink-0" />}
                  {r.categoryText}
                </td>
                <td className="py-1.5 pr-2">
                  <select
                    value={s.category || ""}
                    onChange={(e) => setCategory(r.key, e.target.value)}
                    className="rounded border border-mist px-1.5 py-1 text-xs max-w-[180px]"
                  >
                    {categoryOptionsFor(r.categoryText)}
                  </select>
                </td>
                <td className="py-1.5 pr-2">
                  {settings.currency}
                  {r.planned.toLocaleString()}
                </td>
                <td className="py-1.5 pr-2">
                  <input
                    type="checkbox"
                    checked={s.recurring ?? true}
                    disabled={!r.monthKey}
                    title={
                      r.monthKey
                        ? "Uncheck to apply this budget only to " + r.month
                        : "Couldn't tell which month this is from a dated row — applying as recurring"
                    }
                    onChange={(e) => setRecurring(r.key, e.target.checked)}
                  />
                </td>
                <td className="py-1.5 pr-2 text-ink/50">{r.month}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    <Pagination page={page} pageSize={ROWS_PAGE_SIZE} total={rows.length} onPageChange={setPage} />
    </div>
  );
}

function ImportedExpensesReview({
  expenses,
  categories,
  settings,
  updateExpense,
  removeExpense,
  onRemoveFromList,
  onUpdateInList,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [page, setPage] = useState(1);

  if (expenses.length === 0) {
    return (
      <p className="text-ink/50 text-sm py-6 text-center">
        Nothing was imported — no rows were selected.
      </p>
    );
  }

  const pageExpenses = expenses.slice((page - 1) * ROWS_PAGE_SIZE, page * ROWS_PAGE_SIZE);

  function startEdit(e) {
    setEditingId(e._id);
    setEditForm({
      date: toInputDate(e.date),
      category: e.category,
      amount: String(e.amount),
      note: e.note || "",
      person: e.person || "mine",
    });
  }

  async function saveEdit(id) {
    const updated = await updateExpense(id, {
      date: fromInputDate(editForm.date),
      category: editForm.category,
      amount: parseFloat(editForm.amount) || 0,
      note: editForm.note,
      person: editForm.person,
    });
    onUpdateInList(id, updated);
    setEditingId(null);
    setEditForm(null);
  }

  async function handleDelete(id) {
    await removeExpense(id);
    onRemoveFromList(id);
  }

  return (
    <div>
    <div className="overflow-x-auto scroll-fade-x">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-ink/50 border-b border-mist">
            <th className="py-2 pr-2">Date</th>
            <th className="py-2 pr-2">Category</th>
            <th className="py-2 pr-2">Person</th>
            <th className="py-2 pr-2">Amount</th>
            <th className="py-2 pr-2">Note</th>
            <th className="py-2 pr-2 w-16"></th>
          </tr>
        </thead>
        <tbody>
          {pageExpenses.map((e) =>
            editingId === e._id ? (
              <tr key={e._id} className="border-b border-mist/60">
                <td className="py-1.5 pr-2">
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(ev) => setEditForm((f) => ({ ...f, date: ev.target.value }))}
                    className="rounded border border-mist px-1.5 py-1 text-xs"
                  />
                </td>
                <td className="py-1.5 pr-2">
                  <select
                    value={editForm.category}
                    onChange={(ev) => setEditForm((f) => ({ ...f, category: ev.target.value }))}
                    className="rounded border border-mist px-1.5 py-1 text-xs max-w-[160px]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-1.5 pr-2">
                  <select
                    value={editForm.person}
                    onChange={(ev) => setEditForm((f) => ({ ...f, person: ev.target.value }))}
                    className="rounded border border-mist px-1.5 py-1 text-xs"
                  >
                    <option value="mine">{settings.myLabel}</option>
                    <option value="spouse">{settings.spouseLabel}</option>
                  </select>
                </td>
                <td className="py-1.5 pr-2">
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.amount}
                    onChange={(ev) => setEditForm((f) => ({ ...f, amount: ev.target.value }))}
                    className="w-20 rounded border border-mist px-1.5 py-1 text-xs"
                  />
                </td>
                <td className="py-1.5 pr-2">
                  <input
                    type="text"
                    value={editForm.note}
                    onChange={(ev) => setEditForm((f) => ({ ...f, note: ev.target.value }))}
                    className="rounded border border-mist px-1.5 py-1 text-xs w-full"
                  />
                </td>
                <td className="py-1.5 pr-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => saveEdit(e._id)}
                      className="rounded bg-[var(--accent)] text-white p-1 hover:bg-[var(--accent-hover)]"
                      aria-label="Save"
                    >
                      <Check size={13} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditForm(null);
                      }}
                      className="rounded border border-mist p-1 hover:bg-mist/40"
                      aria-label="Cancel"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={e._id} className="border-b border-mist/60">
                <td className="py-1.5 pr-2 whitespace-nowrap">{toInputDate(e.date)}</td>
                <td className="py-1.5 pr-2">
                  {categories.find((c) => c.id === e.category)?.label || e.category}
                </td>
                <td className="py-1.5 pr-2">
                  {e.person === "spouse" ? settings.spouseLabel : settings.myLabel}
                </td>
                <td className="py-1.5 pr-2">
                  {settings.currency}
                  {e.amount.toLocaleString()}
                </td>
                <td className="py-1.5 pr-2 truncate max-w-[160px]">{e.note}</td>
                <td className="py-1.5 pr-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(e)}
                      className="text-ink/30 hover:text-plum transition"
                      aria-label="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(e._id)}
                      className="text-ink/30 hover:text-red-500 transition"
                      aria-label="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
    <Pagination page={page} pageSize={ROWS_PAGE_SIZE} total={expenses.length} onPageChange={setPage} />
    </div>
  );
}
