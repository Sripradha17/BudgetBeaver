// Plain client-side CSV export — no server round trip needed since the
// caller already has everything in DataContext. Two files (expenses,
// income) rather than one combined sheet, matching how every mainstream
// budgeting app (Mint, YNAB, Monarch) splits its data exports.
function toCsv(rows, columns) {
  const escape = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.map((c) => c.label).join(",");
  const lines = rows.map((row) => columns.map((c) => escape(c.value(row))).join(","));
  return [header, ...lines].join("\n");
}

function download(filename, content) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportExpensesCsv(expenses, categoryById, settings) {
  const csv = toCsv(expenses, [
    { label: "Date", value: (e) => new Date(e.date).toISOString().slice(0, 10) },
    { label: "Category", value: (e) => categoryById[e.category]?.label || e.category },
    { label: "Amount", value: (e) => e.amount },
    { label: "Note", value: (e) => e.note || "" },
    { label: "Person", value: (e) => (e.person === "spouse" ? settings.spouseLabel : settings.myLabel) },
    { label: "Recurring", value: (e) => (e.isRecurring ? "Yes" : "") },
    { label: "Foreign amount", value: (e) => (e.foreignCurrency ? e.foreignAmount : "") },
    { label: "Foreign currency", value: (e) => e.foreignCurrency || "" },
  ]);
  download(`budget-beaver-expenses-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}

export function exportIncomeCsv(income, settings) {
  const csv = toCsv(income, [
    { label: "Date", value: (i) => new Date(i.date).toISOString().slice(0, 10) },
    { label: "Note", value: (i) => i.note || "" },
    { label: "Amount", value: (i) => i.amount },
    { label: "Person", value: (i) => (i.person === "spouse" ? settings.spouseLabel : settings.myLabel) },
  ]);
  download(`budget-beaver-income-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
