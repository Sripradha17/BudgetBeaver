import { useEffect, useMemo, useState } from "react";
import { Trash2, Plus, Wallet, Users, PiggyBank } from "lucide-react";
import { useData } from "../context/DataContext.jsx";
import { useMonth } from "../context/MonthContext.jsx";
import { monthKey, toInputDate, fromInputDate } from "../lib/month.js";
import { useUndoDelete } from "../hooks/useUndoDelete.js";
import Card from "../components/Card.jsx";
import PageHero from "../components/PageHero.jsx";
import { illustrations, HERO_ASPECT, illustrationEdgeColor } from "../assets/illustrations/index.js";
import Pagination from "../components/Pagination.jsx";
import UndoToast from "../components/UndoToast.jsx";

const PAGE_SIZE = 25;

export default function IncomePage() {
  const { income, settings, addIncome, removeIncome } = useData();
  const { key } = useMonth();
  const [page, setPage] = useState(1);

  const {
    pending: pendingDelete,
    deleteWithUndo,
    undo: undoDelete,
    dismiss: dismissUndo,
  } = useUndoDelete({
    onDelete: (item) => removeIncome(item._id),
    onRestore: (item) =>
      addIncome({
        date: item.date,
        amount: item.amount,
        person: item.person,
        note: item.note,
      }),
  });

  function handleDeleteIncome(item) {
    const label = item.note || (item.person === "mine" ? settings.myLabel : settings.spouseLabel);
    deleteWithUndo(item, `"${label}" income deleted`);
  }

  const [form, setForm] = useState({
    date: toInputDate(new Date()),
    amount: "",
    person: "mine",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const monthIncome = useMemo(
    () =>
      income
        .filter((i) => monthKey(new Date(i.date)) === key)
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [income, key]
  );

  useEffect(() => {
    setPage(1);
  }, [key]);

  const pageIncome = monthIncome.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totals = useMemo(() => {
    const mine = monthIncome.filter((i) => i.person === "mine").reduce((s, i) => s + i.amount, 0);
    const spouse = monthIncome.filter((i) => i.person === "spouse").reduce((s, i) => s + i.amount, 0);
    return { mine, spouse, combined: mine + spouse };
  }, [monthIncome]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.amount) return;
    setSubmitting(true);
    try {
      await addIncome({
        date: fromInputDate(form.date),
        amount: parseFloat(form.amount),
        person: form.person,
        note: form.note,
      });
      setForm((f) => ({ ...f, amount: "", note: "" }));
    } finally {
      setSubmitting(false);
    }
  }

  const fmt = (n) => `${settings.currency}${n.toLocaleString()}`;

  return (
    <div className="space-y-5">
      <PageHero
        tint="teal"
        eyebrow="Income"
        title="Every dollar in"
        description="Track paychecks and other income as it lands — yours, theirs, and the combined picture."
        image={illustrations.income}
        aspect={HERO_ASPECT}
        edgeColor={illustrationEdgeColor.income}
      />

      <div className="grid grid-cols-3 gap-3">
        <IncomeStatCard label={settings.myLabel} value={fmt(totals.mine)} icon={Wallet} />
        <IncomeStatCard label={settings.spouseLabel} value={fmt(totals.spouse)} icon={Wallet} />
        <IncomeStatCard label="Combined" value={fmt(totals.combined)} icon={Users} />
      </div>

      <Card>
        <h2 className="font-bold text-lg mb-3 flex items-center gap-1.5">
          <PiggyBank size={18} className="text-[var(--accent-text)]" /> Log income
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="rounded-lg border border-mist px-3 py-2 text-sm focus:outline-[var(--accent-ring)]"
            required
          />
          <select
            value={form.person}
            onChange={(e) => setForm((f) => ({ ...f, person: e.target.value }))}
            className="rounded-lg border border-mist px-3 py-2 text-sm focus:outline-[var(--accent-ring)]"
          >
            <option value="mine">{settings.myLabel}</option>
            <option value="spouse">{settings.spouseLabel}</option>
          </select>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder={`Amount (${settings.currency})`}
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            className="rounded-lg border border-mist px-3 py-2 text-sm focus:outline-[var(--accent-ring)]"
            required
          />
          <input
            type="text"
            placeholder="Note (optional)"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            className="rounded-lg border border-mist px-3 py-2 text-sm focus:outline-[var(--accent-ring)]"
          />
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] text-white font-medium px-3 py-2 text-sm hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            <Plus size={16} /> Add
          </button>
        </form>
      </Card>

      {/* Same hero language, second time on the page — a quieter inspirational
          break rather than another data card. Both hero photos share the
          page's one teal accent/background now, same as every other page. */}
      <PageHero
        tint="forest"
        title="A healthier you, a brighter tomorrow"
        description="Every source of income you log here is one step closer to your goals."
        image={illustrations.wellness}
        aspect={HERO_ASPECT}
        edgeColor={illustrationEdgeColor.wellness}
      />

      <Card>
        <h2 className="font-bold text-lg mb-3">This month's income</h2>
        {monthIncome.length === 0 ? (
          <p className="text-ink/50 text-sm py-6 text-center">No income logged yet.</p>
        ) : (
          <ul className="rounded-xl border border-mist/70 divide-y divide-mist overflow-hidden">
            {pageIncome.map((i) => (
              <li
                key={i._id}
                className="relative flex items-center justify-between py-2.5 gap-3 pl-4 pr-3 hover:bg-mist/40 transition-colors duration-150 group"
              >
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-[var(--accent)]" />
                <div className="min-w-0 flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--tile-bg)] text-[var(--accent-text)] shrink-0">
                    <Wallet size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {i.person === "mine" ? settings.myLabel : settings.spouseLabel}
                    </p>
                    <p className="text-xs text-ink/50 truncate">
                      {new Date(i.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                      {i.note ? ` · ${i.note}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-display font-bold text-sm tabular-nums text-[var(--accent-text)]">
                    +{fmt(i.amount)}
                  </span>
                  <button
                    onClick={() => handleDeleteIncome(i)}
                    className="text-ink/20 group-hover:text-ink/40 hover:!text-red-500 transition"
                    aria-label="Delete income"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Pagination page={page} pageSize={PAGE_SIZE} total={monthIncome.length} onPageChange={setPage} />
      </Card>
      {pendingDelete && (
        <UndoToast message={pendingDelete.label} onUndo={undoDelete} onDismiss={dismissUndo} />
      )}
    </div>
  );
}

function IncomeStatCard({ label, value, icon: Icon }) {
  return (
    <Card className="border text-center" style={{ backgroundColor: "var(--tile-bg)", borderColor: "var(--tile-border)" }}>
      <div
        className="mx-auto mb-1.5 flex items-center justify-center w-8 h-8 rounded-full"
        style={{ backgroundColor: "var(--accent)", color: "#fff" }}
      >
        <Icon size={15} />
      </div>
      <p className="text-[11px] text-ink/50 uppercase tracking-wide truncate">{label}</p>
      <p
        key={value}
        className="font-display font-bold text-lg tabular-nums animate-page-in"
        style={{ color: "var(--accent-text)" }}
      >
        {value}
      </p>
    </Card>
  );
}
