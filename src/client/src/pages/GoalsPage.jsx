import { useMemo, useState } from "react";
import { Plus, Trash2, Target, PiggyBank, PartyPopper, Pencil, Archive, ArchiveRestore, X, Check } from "lucide-react";
import { useData } from "../context/DataContext.jsx";
import { fromInputDate, toInputDate } from "../lib/month.js";
import Card from "../components/Card.jsx";
import PhotoBanner from "../components/PhotoBanner.jsx";
import PageHero from "../components/PageHero.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { illustrations, illustrationAspect, HERO_ASPECT, illustrationEdgeColor } from "../assets/illustrations/index.js";

export default function GoalsPage() {
  const { expenses, categories, goals, settings, addGoal, updateGoal, removeGoal } = useData();

  const [form, setForm] = useState({
    name: "",
    targetAmount: "",
    targetDate: "",
    linkedCategoryId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [progressEdits, setProgressEdits] = useState({});
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const progressByGoal = useMemo(() => {
    const map = {};
    for (const g of goals) {
      if (g.linkedCategoryId) {
        const start = new Date(g.startDate).getTime();
        map[g._id] = expenses
          .filter((e) => e.category === g.linkedCategoryId && new Date(e.date).getTime() >= start)
          .reduce((s, e) => s + e.amount, 0);
      } else {
        map[g._id] = g.manualProgress || 0;
      }
    }
    return map;
  }, [goals, expenses]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.targetAmount) return;
    setSubmitting(true);
    try {
      await addGoal({
        name: form.name,
        targetAmount: parseFloat(form.targetAmount),
        targetDate: form.targetDate ? fromInputDate(form.targetDate) : undefined,
        linkedCategoryId: form.linkedCategoryId || null,
      });
      setForm({ name: "", targetAmount: "", targetDate: "", linkedCategoryId: "" });
    } finally {
      setSubmitting(false);
    }
  }

  async function saveProgress(goalId) {
    const raw = progressEdits[goalId];
    const amount = parseFloat(raw);
    await updateGoal(goalId, { manualProgress: Number.isNaN(amount) ? 0 : amount });
    setProgressEdits((prev) => {
      const next = { ...prev };
      delete next[goalId];
      return next;
    });
  }

  function startEditGoal(g) {
    setEditingGoalId(g._id);
    setEditForm({
      name: g.name,
      targetAmount: String(g.targetAmount),
      targetDate: g.targetDate ? toInputDate(g.targetDate) : "",
    });
  }

  async function saveEditGoal(goalId) {
    if (!editForm.name.trim() || !editForm.targetAmount) return;
    await updateGoal(goalId, {
      name: editForm.name.trim(),
      targetAmount: parseFloat(editForm.targetAmount),
      targetDate: editForm.targetDate ? fromInputDate(editForm.targetDate) : null,
    });
    setEditingGoalId(null);
    setEditForm(null);
  }

  async function toggleArchived(goalId, archived) {
    await updateGoal(goalId, { archived });
  }

  const activeGoals = useMemo(() => goals.filter((g) => !g.archived), [goals]);
  const archivedGoals = useMemo(() => goals.filter((g) => g.archived), [goals]);

  const fmt = (n) => `${settings.currency}${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  return (
    <div id="goals-page" className="space-y-5">
      {/* This page gets the most emotional real estate — a full-frame hero
          photo up top, an aspirational break lower down, and a real
          celebration photo when a goal is met. Same hero language as every
          other page: photo dissolves into the panel, no card, no border. */}
      <PageHero
        id="goals-hero"
        tint="plum"
        eyebrow="Goals"
        title="Turn saving into doing"
        description="Set a target, track progress, and watch it add up."
        image={illustrations.goals}
        aspect={HERO_ASPECT}
        edgeColor={illustrationEdgeColor.goals}
      />

      <Card id="goals-add-form">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-1.5">
            <PiggyBank size={18} className="text-[var(--accent-text)]" /> New savings goal
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Goal name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="sm:col-span-2 rounded-lg border border-mist px-3 py-2 text-sm focus:outline-[var(--accent-ring)]"
            required
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder={`Target (${settings.currency})`}
            value={form.targetAmount}
            onChange={(e) => setForm((f) => ({ ...f, targetAmount: e.target.value }))}
            className="rounded-lg border border-mist px-3 py-2 text-sm focus:outline-[var(--accent-ring)]"
            required
          />
          <input
            type="date"
            value={form.targetDate}
            onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))}
            className="rounded-lg border border-mist px-3 py-2 text-sm focus:outline-[var(--accent-ring)]"
          />
          <select
            value={form.linkedCategoryId}
            onChange={(e) => setForm((f) => ({ ...f, linkedCategoryId: e.target.value }))}
            className="rounded-lg border border-mist px-3 py-2 text-sm focus:outline-[var(--accent-ring)]"
          >
            <option value="">Track manually</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                Track via {c.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="sm:col-span-2 xl:col-span-5 flex items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] text-white font-medium px-3 py-2 text-sm hover:bg-[var(--accent-hover)] disabled:opacity-50 sm:w-auto sm:justify-self-start sm:px-6"
          >
            <Plus size={16} /> Add goal
          </button>
        </form>
      </Card>

      {activeGoals.length === 0 ? (
        <Card id="goals-list">
          <EmptyState
            image={illustrations.goalsAdventure}
            aspect={illustrationAspect.goalsAdventure}
            tint="plum"
            message="No savings goals yet — add one above to start tracking."
          />
        </Card>
      ) : (
        <div id="goals-list" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activeGoals.some((g) => {
            const progress = progressByGoal[g._id] || 0;
            return g.targetAmount > 0 && progress >= g.targetAmount;
          }) && (
            <Card className="sm:col-span-2 border-gold/40 bg-gold/[0.05]">
              <div className="flex items-center gap-4">
                <PhotoBanner
                  src={illustrations.goalReached}
                  tint="gold"
                  aspect={illustrationAspect.goalReached}
                  className="h-24 shrink-0"
                />
                <div>
                  <h3 className="font-display font-bold text-ink">Nice work — a goal is fully funded!</h3>
                  <p className="text-sm text-ink/55 mt-0.5">Keep the momentum going on the rest below.</p>
                </div>
              </div>
            </Card>
          )}
          {activeGoals.map((g, idx) => {
            const progress = progressByGoal[g._id] || 0;
            const pct = g.targetAmount > 0 ? Math.min(100, (progress / g.targetAmount) * 100) : 0;
            const reached = pct >= 100;
            const category = categories.find((c) => c.id === g.linkedCategoryId);
            const isEditingProgress = progressEdits[g._id] !== undefined;
            const isEditingGoal = editingGoalId === g._id;

            return (
              <Card
                key={g._id}
                className={`animate-page-in hover:-translate-y-0.5 transition-all duration-200 ${
                  reached ? "border border-gold/40 bg-gold/[0.05]" : ""
                }`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-2 gap-2">
                  {isEditingGoal ? (
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full rounded border border-mist px-2 py-1 text-sm font-semibold"
                        placeholder="Goal name"
                      />
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editForm.targetAmount}
                          onChange={(e) => setEditForm((f) => ({ ...f, targetAmount: e.target.value }))}
                          className="w-24 rounded border border-mist px-2 py-1 text-xs"
                          placeholder="Target"
                        />
                        <input
                          type="date"
                          value={editForm.targetDate}
                          onChange={(e) => setEditForm((f) => ({ ...f, targetDate: e.target.value }))}
                          className="flex-1 rounded border border-mist px-2 py-1 text-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 min-w-0">
                      {reached ? (
                        <PartyPopper size={16} className="text-gold shrink-0" />
                      ) : (
                        <Target size={16} className="text-[var(--accent-text)] shrink-0" />
                      )}
                      <span className="font-semibold text-sm truncate">{g.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 shrink-0">
                    {isEditingGoal ? (
                      <>
                        <button
                          onClick={() => saveEditGoal(g._id)}
                          className="text-[var(--accent-text)] hover:opacity-70"
                          aria-label="Save"
                        >
                          <Check size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingGoalId(null);
                            setEditForm(null);
                          }}
                          className="text-ink/30 hover:text-ink"
                          aria-label="Cancel"
                        >
                          <X size={15} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditGoal(g)}
                          className="text-ink/30 hover:text-ink"
                          aria-label={`Edit ${g.name}`}
                        >
                          <Pencil size={14} />
                        </button>
                        {reached && (
                          <button
                            onClick={() => toggleArchived(g._id, true)}
                            className="text-ink/30 hover:text-[var(--accent-text)]"
                            aria-label={`Archive ${g.name}`}
                            title="Archive (hides it without deleting)"
                          >
                            <Archive size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => removeGoal(g._id)}
                          className="text-ink/30 hover:text-red-500"
                          aria-label={`Delete ${g.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-mist overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full transition-[width] duration-700 ease-out ${
                      reached ? "bg-gradient-to-r from-gold to-[var(--accent)]" : "bg-[var(--accent)]"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-ink/60">
                  <span>
                    {fmt(progress)} of {fmt(g.targetAmount)}
                  </span>
                  <span className={reached ? "text-gold font-semibold" : ""}>
                    {reached ? "Goal reached!" : `${pct.toFixed(0)}%`}
                  </span>
                </div>
                {category && (
                  <p className="text-xs text-ink/40 mt-1">Tracked via {category.label} spending</p>
                )}
                {g.targetDate && (
                  <p className="text-xs text-ink/40 mt-0.5">
                    By {new Date(g.targetDate).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                  </p>
                )}
                {!g.linkedCategoryId && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Update progress"
                      value={isEditingProgress ? progressEdits[g._id] : ""}
                      onChange={(e) =>
                        setProgressEdits((prev) => ({ ...prev, [g._id]: e.target.value }))
                      }
                      onKeyDown={(e) => e.key === "Enter" && saveProgress(g._id)}
                      className="flex-1 rounded border border-mist px-2 py-1 text-xs"
                    />
                    {isEditingProgress && (
                      <button
                        onClick={() => saveProgress(g._id)}
                        className="rounded bg-[var(--accent)] text-white text-xs font-medium px-2 py-1 hover:bg-[var(--accent-hover)]"
                      >
                        Save
                      </button>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {archivedGoals.length > 0 && (
        <Card id="goals-archived">
          <button
            onClick={() => setShowArchived((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink"
          >
            <ArchiveRestore size={15} />
            {showArchived ? "Hide" : "Show"} archived goals ({archivedGoals.length})
          </button>
          {showArchived && (
            <ul className="divide-y divide-mist mt-3">
              {archivedGoals.map((g) => (
                <li key={g._id} className="flex items-center justify-between py-2 text-sm gap-2">
                  <span className="truncate text-ink/60">{g.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleArchived(g._id, false)}
                      className="text-xs font-medium text-[var(--accent-text)] hover:underline"
                    >
                      Unarchive
                    </button>
                    <button
                      onClick={() => removeGoal(g._id)}
                      className="text-ink/30 hover:text-red-500"
                      aria-label={`Delete ${g.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
