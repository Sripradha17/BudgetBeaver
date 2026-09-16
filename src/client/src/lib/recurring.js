import { monthKey, toInputDate, fromInputDate } from "./month.js";

function normNote(note) {
  return String(note || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// A recurring "template" is the most recent isRecurring=true expense for a given
// note — later edits (amount changes, category fixes) supersede older ones with
// the same note so the carried-forward copy always reflects the latest value.
export function getRecurringTemplates(expenses) {
  const byNote = new Map();
  for (const e of expenses) {
    if (!e.isRecurring) continue;
    const key = normNote(e.note);
    if (!key) continue;
    const existing = byNote.get(key);
    if (!existing || new Date(e.date) > new Date(existing.date)) {
      byNote.set(key, e);
    }
  }
  return [...byNote.values()];
}

function daysInMonth(monthKeyStr) {
  const [y, m] = monthKeyStr.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

// Recurring templates whose month is before `targetMonthKey` and that don't
// already have a matching (by note) expense that month, mapped to ready-to-insert
// expense payloads landing on the same day-of-month (clamped to the shorter month).
export function getMissingRecurringForMonth(expenses, targetMonthKey) {
  // A charge can't be "missing" from a month that hasn't happened yet — without
  // this, browsing the month picker forward and clicking "Add all" repeatedly
  // creates real future-dated expense rows that never actually occurred, which
  // silently inflates every all-time total (Reports' net worth, savings rate, etc).
  if (targetMonthKey > monthKey(new Date())) return [];

  const templates = getRecurringTemplates(expenses);
  const monthExpenses = expenses.filter((e) => monthKey(new Date(e.date)) === targetMonthKey);
  const presentNotes = new Set(monthExpenses.map((e) => normNote(e.note)));

  const missing = [];
  for (const t of templates) {
    const templateMonth = monthKey(new Date(t.date));
    if (templateMonth >= targetMonthKey) continue;
    if (presentNotes.has(normNote(t.note))) continue;

    const day = Number(toInputDate(t.date).split("-")[2]);
    const clampedDay = Math.min(day, daysInMonth(targetMonthKey));
    const dateInput = `${targetMonthKey}-${String(clampedDay).padStart(2, "0")}`;

    missing.push({
      date: fromInputDate(dateInput),
      category: t.category,
      amount: t.amount,
      note: t.note,
      person: t.person || "mine",
      isRecurring: true,
    });
  }
  return missing;
}
