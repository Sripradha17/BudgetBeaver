import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, AlertTriangle, LogOut, Bell, BellOff, Download, Mail } from "lucide-react";
import { useData } from "../context/DataContext.jsx";
import { colorForNewCategory } from "../lib/categories.js";
import { clearToken, getCurrentUserEmail } from "../lib/api.js";
import { enableBillReminders, disableBillReminders, getBillReminderStatus } from "../lib/push.js";
import { CURRENCIES } from "../lib/currency.js";
import { exportExpensesCsv, exportIncomeCsv } from "../lib/exportData.js";
import Card from "../components/Card.jsx";
import CategoryBadge from "../components/CategoryBadge.jsx";
import PageHero from "../components/PageHero.jsx";
import { illustrations, HERO_ASPECT, illustrationEdgeColor } from "../assets/illustrations/index.js";

export default function SettingsPage({ onLogout }) {
  const {
    expenses,
    income,
    settings,
    customCategories,
    categories,
    updateSettings,
    addCategory,
    removeCategory,
    resetAll,
    setBudget,
  } = useData();

  const [currency, setCurrency] = useState(settings.currency);
  const [baseCurrencyCode, setBaseCurrencyCode] = useState(settings.baseCurrencyCode);
  const [myLabel, setMyLabel] = useState(settings.myLabel);
  const [spouseLabel, setSpouseLabel] = useState(settings.spouseLabel);
  const userEmail = getCurrentUserEmail();
  const categoryById = useMemo(() => {
    const map = {};
    categories.forEach((c) => (map[c.id] = c));
    return map;
  }, [categories]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryBudget, setNewCategoryBudget] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pushStatus, setPushStatus] = useState("checking");
  const [pushError, setPushError] = useState(null);
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    getBillReminderStatus().then(setPushStatus);
  }, []);

  async function handleTogglePush() {
    setPushBusy(true);
    setPushError(null);
    try {
      if (pushStatus === "enabled") {
        await disableBillReminders();
        setPushStatus("disabled");
      } else {
        await enableBillReminders();
        setPushStatus("enabled");
      }
    } catch (err) {
      setPushError(err.message);
    } finally {
      setPushBusy(false);
    }
  }

  async function handleSaveGeneral(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({ currency, baseCurrencyCode, myLabel, spouseLabel });
    } finally {
      setSaving(false);
    }
  }

  async function handleAddCategory(e) {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await addCategory({
      id,
      label: name,
      badgeColor: colorForNewCategory(customCategories.length),
    });
    const budgetAmount = parseFloat(newCategoryBudget);
    if (!Number.isNaN(budgetAmount) && budgetAmount > 0) {
      await setBudget(id, budgetAmount);
    }
    setNewCategoryName("");
    setNewCategoryBudget("");
  }

  async function handleReset() {
    await resetAll();
    setConfirmReset(false);
  }

  return (
    <div id="settings-page" className="space-y-5">
      <PageHero
        id="settings-hero"
        tint="teal"
        eyebrow="Settings"
        title="Small changes, big control"
        description="Fine-tune currency, categories, and reminders — make Budget Raccoon fit exactly how you manage money."
        image={illustrations.goalsAdventure}
        aspect={HERO_ASPECT}
        edgeColor={illustrationEdgeColor.goalsAdventure}
      />

      {userEmail && (
        <Card id="settings-account">
          <h2 className="font-bold text-lg mb-2 flex items-center gap-1.5">
            <Mail size={17} className="text-[var(--accent-text)]" /> Account
          </h2>
          <p className="text-sm text-ink/70">
            Signed in as <span className="font-medium text-ink">{userEmail}</span>
          </p>
          <p className="text-xs text-ink/50 mt-1">
            Data you add here is only ever visible to your household — no one else can see or
            edit it.
          </p>
        </Card>
      )}

      <Card id="settings-general">
        <h2 className="font-bold text-lg mb-3">General</h2>
        <form onSubmit={handleSaveGeneral} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <label className="text-sm">
            Currency symbol
            <input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-1 w-full rounded-lg border border-mist px-3 py-2 text-sm focus:outline-[var(--accent-ring)]"
            />
          </label>
          <label className="text-sm">
            Base currency
            <select
              value={baseCurrencyCode}
              onChange={(e) => setBaseCurrencyCode(e.target.value)}
              className="mt-1 w-full rounded-lg border border-mist px-3 py-2 text-sm focus:outline-[var(--accent-ring)]"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Your label
            <input
              value={myLabel}
              onChange={(e) => setMyLabel(e.target.value)}
              className="mt-1 w-full rounded-lg border border-mist px-3 py-2 text-sm focus:outline-[var(--accent-ring)]"
            />
          </label>
          <label className="text-sm">
            Spouse label
            <input
              value={spouseLabel}
              onChange={(e) => setSpouseLabel(e.target.value)}
              className="mt-1 w-full rounded-lg border border-mist px-3 py-2 text-sm focus:outline-[var(--accent-ring)]"
            />
          </label>
          <p className="sm:col-span-4 text-xs text-ink/50 -mt-1">
            Base currency is what every total, chart, and budget is calculated in. Logging an
            expense in a different currency converts it to this one automatically.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="sm:col-span-4 justify-self-start rounded-lg bg-[var(--accent)] text-white text-sm font-medium px-4 py-2 hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            Save
          </button>
        </form>
      </Card>

      <Card id="settings-categories">
        <h2 className="font-bold text-lg mb-3">Categories</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((c, idx) => (
            <div key={c.id} className="flex items-center gap-1">
              <CategoryBadge category={c} index={idx} />
              {c.isCustom && (
                <button
                  onClick={() => removeCategory(c.id)}
                  className="text-ink/30 hover:text-red-500"
                  aria-label={`Delete ${c.label}`}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-ink/50 mb-2">
          Budget allocations are edited on the Budgets page.
        </p>
        <form onSubmit={handleAddCategory} className="flex flex-wrap gap-2">
          <input
            placeholder="New category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 min-w-[140px] rounded-lg border border-mist px-3 py-2 text-sm focus:outline-[var(--accent-ring)]"
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder={`Budget (${settings.currency}, optional)`}
            value={newCategoryBudget}
            onChange={(e) => setNewCategoryBudget(e.target.value)}
            className="w-40 rounded-lg border border-mist px-3 py-2 text-sm focus:outline-[var(--accent-ring)]"
          />
          <button
            type="submit"
            className="shrink-0 flex items-center gap-1.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium px-3 py-2 hover:bg-[var(--accent-hover)]"
          >
            <Plus size={16} /> Add
          </button>
        </form>
      </Card>

      <Card id="settings-bill-reminders">
        <h2 className="font-bold text-lg mb-1 flex items-center gap-1.5">
          {pushStatus === "enabled" ? <Bell size={17} className="text-[var(--accent-text)]" /> : <BellOff size={17} />}
          Bill reminders
        </h2>
        <p className="text-xs text-ink/50 mb-3">
          A push notification the day before any recurring bill is due — install the app to your
          home screen first for this to work reliably.
        </p>
        {pushStatus === "unsupported" ? (
          <p className="text-xs text-ink/50">Not supported on this device/browser.</p>
        ) : pushStatus === "denied" ? (
          <p className="text-xs text-ink/50">
            Notifications are blocked for this site — enable them in your browser settings to turn
            this on.
          </p>
        ) : (
          <button
            onClick={handleTogglePush}
            disabled={pushBusy || pushStatus === "checking"}
            className={`rounded-lg text-sm font-medium px-4 py-2 disabled:opacity-50 ${
              pushStatus === "enabled"
                ? "border border-mist hover:bg-mist/40"
                : "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
            }`}
          >
            {pushBusy
              ? "Please wait…"
              : pushStatus === "enabled"
              ? "Turn off reminders"
              : "Turn on reminders"}
          </button>
        )}
        {pushError && <p className="text-xs text-red-400 mt-2">{pushError}</p>}
      </Card>

      <Card id="settings-export">
        <h2 className="font-bold text-lg mb-1 flex items-center gap-1.5">
          <Download size={17} className="text-[var(--accent-text)]" /> Export your data
        </h2>
        <p className="text-xs text-ink/50 mb-3">
          Download everything as CSV — for your own records, or to open in a spreadsheet.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportExpensesCsv(expenses, categoryById, settings)}
            disabled={expenses.length === 0}
            className="rounded-lg border border-mist text-sm font-medium px-4 py-2 hover:bg-mist/40 disabled:opacity-40"
          >
            Expenses ({expenses.length})
          </button>
          <button
            onClick={() => exportIncomeCsv(income, settings)}
            disabled={income.length === 0}
            className="rounded-lg border border-mist text-sm font-medium px-4 py-2 hover:bg-mist/40 disabled:opacity-40"
          >
            Income ({income.length})
          </button>
        </div>
      </Card>

      <Card id="settings-logout">
        <button
          onClick={() => {
            clearToken();
            onLogout();
          }}
          className="flex items-center gap-1.5 text-sm font-medium text-ink/70 hover:text-ink"
        >
          <LogOut size={15} /> Log out
        </button>
      </Card>

      <Card id="settings-danger-zone" className="border border-red-500/30">
        <h2 className="font-bold text-lg mb-2 text-red-400 flex items-center gap-2">
          <AlertTriangle size={18} /> Danger zone
        </h2>
        <p className="text-sm text-ink/60 mb-3">
          This permanently deletes all expenses, income, custom categories, and settings from
          MongoDB. This cannot be undone.
        </p>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="rounded-lg border border-red-500/40 text-red-400 text-sm font-medium px-4 py-2 hover:bg-red-500/10"
          >
            Reset all data
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Are you sure?</span>
            <button
              onClick={handleReset}
              className="rounded-lg bg-red-600 text-white text-sm font-medium px-4 py-2 hover:bg-red-700"
            >
              Yes, delete everything
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="rounded-lg border border-mist text-sm font-medium px-4 py-2"
            >
              Cancel
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
