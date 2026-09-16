import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, AlertTriangle, LogOut, Bell, BellOff, Download, Mail, Users, Copy, Check, RefreshCw, UserMinus, Undo2 } from "lucide-react";
import { useData } from "../context/DataContext.jsx";
import { colorForNewCategory, ICON_OPTIONS, COLOR_OPTIONS } from "../lib/categories.js";
import { api, clearToken, getCurrentUserEmail, getCurrentUserName } from "../lib/api.js";
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
  const [newCategoryIcon, setNewCategoryIcon] = useState("MoreHorizontal");
  const [newCategoryColor, setNewCategoryColor] = useState(COLOR_OPTIONS[0]);
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pushStatus, setPushStatus] = useState("checking");
  const [pushError, setPushError] = useState(null);
  const [pushBusy, setPushBusy] = useState(false);
  const [household, setHousehold] = useState(null);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [confirmRemoveMember, setConfirmRemoveMember] = useState(null);
  const [removingMember, setRemovingMember] = useState(false);
  const [memberError, setMemberError] = useState(null);
  const [myName, setMyName] = useState(getCurrentUserName() || "");
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  useEffect(() => {
    getBillReminderStatus().then(setPushStatus);
  }, []);

  useEffect(() => {
    api.getHousehold().then(setHousehold).catch(() => {});
  }, []);

  async function handleCopyInvite() {
    if (!household) return;
    try {
      await navigator.clipboard.writeText(household.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied — the code is still visible on screen to copy by hand.
    }
  }

  async function handleRegenerateInvite() {
    setRegenerating(true);
    try {
      const { inviteCode } = await api.regenerateInvite();
      setHousehold((h) => ({ ...h, inviteCode }));
      setConfirmRegenerate(false);
    } finally {
      setRegenerating(false);
    }
  }

  async function handleSaveName(e) {
    e.preventDefault();
    const trimmed = myName.trim();
    if (!trimmed) return;
    setSavingName(true);
    try {
      await api.updateProfile(trimmed);
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 1500);
    } finally {
      setSavingName(false);
    }
  }

  async function handleRemoveMember(userId) {
    setRemovingMember(true);
    setMemberError(null);
    try {
      await api.removeMember(userId);
      setHousehold((h) => ({ ...h, members: h.members.filter((m) => m._id !== userId) }));
      setConfirmRemoveMember(null);
    } catch (err) {
      setMemberError(err.message);
    } finally {
      setRemovingMember(false);
    }
  }

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
      badgeColor: newCategoryColor,
      icon: newCategoryIcon,
    });
    const budgetAmount = parseFloat(newCategoryBudget);
    if (!Number.isNaN(budgetAmount) && budgetAmount > 0) {
      await setBudget(id, budgetAmount);
    }
    setNewCategoryName("");
    setNewCategoryBudget("");
    setNewCategoryIcon("MoreHorizontal");
    setNewCategoryColor(colorForNewCategory(customCategories.length + 1));
  }

  async function handleReset() {
    await resetAll();
    setConfirmReset(false);
  }

  async function handleUndismissRecurringMonth(monthToRestore) {
    const next = (settings.dismissedRecurringMonths || []).filter((m) => m !== monthToRestore);
    await updateSettings({ dismissedRecurringMonths: next });
  }

  async function handleUnignoreDuplicate(signatureToRestore) {
    const next = (settings.ignoredDuplicateSignatures || []).filter((s) => s !== signatureToRestore);
    await updateSettings({ ignoredDuplicateSignatures: next });
  }

  return (
    <div id="settings-page" className="space-y-5">
      <PageHero
        id="settings-hero"
        tint="teal"
        eyebrow="Settings"
        title="Small changes, big control"
        description="Fine-tune currency, categories, and reminders — make Budget Beaver fit exactly how you manage money."
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
          <p className="text-xs text-ink/50 mt-1 mb-3">
            Data you add here is only ever visible to your household — no one else can see or
            edit it.
          </p>
          <form onSubmit={handleSaveName} className="flex flex-wrap items-end gap-2">
            <label className="text-sm">
              Your name
              <input
                value={myName}
                onChange={(e) => {
                  setMyName(e.target.value);
                  setNameSaved(false);
                }}
                className="mt-1 w-48 rounded-lg border border-mist px-3 py-2 text-sm focus:outline-[var(--accent-ring)]"
                placeholder="What should we call you?"
              />
            </label>
            <button
              type="submit"
              disabled={savingName || !myName.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium px-4 py-2 hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {nameSaved ? <Check size={15} /> : null}
              {savingName ? "Saving…" : nameSaved ? "Saved" : "Save"}
            </button>
          </form>
          <p className="text-xs text-ink/40 mt-1.5">
            Used for your own greeting on the Home page — separate from the "Your label" /
            "Spouse label" fields below, which tag who an expense or income entry belongs to.
          </p>
        </Card>
      )}

      {household && (
        <Card id="settings-household">
          <h2 className="font-bold text-lg mb-1 flex items-center gap-1.5">
            <Users size={17} className="text-[var(--accent-text)]" /> Household
          </h2>
          <p className="text-xs text-ink/50 mb-3">
            Share this invite code with your partner so their account joins your household
            instead of starting a separate, empty one.
          </p>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="rounded-lg bg-mist/50 px-4 py-2 text-sm font-mono font-semibold tracking-[0.2em]">
              {household.inviteCode}
            </span>
            <button
              onClick={handleCopyInvite}
              className="flex items-center gap-1.5 rounded-lg border border-mist text-sm font-medium px-3 py-2 hover:bg-mist/40"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
            {!confirmRegenerate ? (
              <button
                onClick={() => setConfirmRegenerate(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-ink/50 hover:text-ink px-2 py-2"
              >
                <RefreshCw size={14} /> New code
              </button>
            ) : (
              <span className="flex items-center gap-2 text-sm">
                <span className="text-ink/60">Old code stops working. Sure?</span>
                <button
                  onClick={handleRegenerateInvite}
                  disabled={regenerating}
                  className="rounded-lg bg-[var(--accent)] text-white text-sm font-medium px-3 py-1.5 hover:bg-[var(--accent-hover)] disabled:opacity-50"
                >
                  {regenerating ? "Please wait…" : "Yes, regenerate"}
                </button>
                <button
                  onClick={() => setConfirmRegenerate(false)}
                  className="rounded-lg border border-mist text-sm font-medium px-3 py-1.5"
                >
                  Cancel
                </button>
              </span>
            )}
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/40 mb-2">
            Members ({household.members.length})
          </p>
          <ul className="divide-y divide-mist rounded-lg border border-mist/70 overflow-hidden">
            {household.members.map((m) => {
              const isMe = m.email === userEmail;
              return (
                <li key={m._id} className="flex items-center justify-between px-3 py-2 text-sm gap-2">
                  <span className="truncate">
                    {m.email}
                    {isMe && <span className="text-ink/40"> (you)</span>}
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-ink/40">
                      Joined {new Date(m.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                    </span>
                    {!isMe &&
                      (confirmRemoveMember === m._id ? (
                        <span className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleRemoveMember(m._id)}
                            disabled={removingMember}
                            className="rounded bg-red-600 text-white text-xs font-medium px-2 py-1 hover:bg-red-700 disabled:opacity-50"
                          >
                            {removingMember ? "…" : "Remove"}
                          </button>
                          <button
                            onClick={() => setConfirmRemoveMember(null)}
                            className="rounded border border-mist text-xs font-medium px-2 py-1"
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setConfirmRemoveMember(m._id)}
                          className="text-ink/30 hover:text-red-500"
                          aria-label={`Remove ${m.email}`}
                        >
                          <UserMinus size={14} />
                        </button>
                      ))}
                  </span>
                </li>
              );
            })}
          </ul>
          {memberError && <p className="text-xs text-red-400 mt-2">{memberError}</p>}
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
              {c.isCustom &&
                (confirmDeleteCategory === c.id ? (
                  <span className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        removeCategory(c.id);
                        setConfirmDeleteCategory(null);
                      }}
                      className="rounded bg-red-600 text-white text-[11px] font-medium px-1.5 py-0.5 hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmDeleteCategory(null)}
                      className="text-ink/40 text-[11px] px-1"
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteCategory(c.id)}
                    className="text-ink/30 hover:text-red-500"
                    aria-label={`Delete ${c.label}`}
                  >
                    <Trash2 size={14} />
                  </button>
                ))}
            </div>
          ))}
        </div>
        <p className="text-xs text-ink/50 mb-2">
          Budget allocations are edited on the Budgets page.
        </p>
        <form onSubmit={handleAddCategory} className="space-y-2.5">
          <div className="flex flex-wrap gap-2">
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
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-ink/50 mr-1">Icon</span>
              {Object.entries(ICON_OPTIONS).map(([name, Icon]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setNewCategoryIcon(name)}
                  aria-label={name}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
                    newCategoryIcon === name ? "border-[var(--accent)] bg-[var(--tile-bg)]" : "border-mist text-ink/50"
                  }`}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-ink/50 mr-1">Color</span>
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewCategoryColor(color)}
                  aria-label={color}
                  className="h-6 w-6 rounded-full"
                  style={{
                    backgroundColor: color,
                    outline: newCategoryColor === color ? "2px solid var(--accent)" : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>
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

      {((settings.dismissedRecurringMonths || []).length > 0 ||
        (settings.ignoredDuplicateSignatures || []).length > 0) && (
        <Card id="settings-dismissed">
          <h2 className="font-bold text-lg mb-1 flex items-center gap-1.5">
            <Undo2 size={17} className="text-[var(--accent-text)]" /> Dismissed &amp; ignored
          </h2>
          <p className="text-xs text-ink/50 mb-3">
            "Not this month" nudges and "Keep" clicks on possible duplicates, in case one was a
            mistake.
          </p>
          {(settings.dismissedRecurringMonths || []).length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/40 mb-1.5">
                Skipped recurring-charge reminders
              </p>
              <ul className="space-y-1">
                {settings.dismissedRecurringMonths.map((m) => (
                  <li key={m} className="flex items-center justify-between text-sm">
                    <span>{m}</span>
                    <button
                      onClick={() => handleUndismissRecurringMonth(m)}
                      className="text-xs font-medium text-[var(--accent-text)] hover:underline"
                    >
                      Show reminder again
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(settings.ignoredDuplicateSignatures || []).length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/40 mb-1.5">
                Kept as separate transactions
              </p>
              <ul className="space-y-1">
                {settings.ignoredDuplicateSignatures.map((sig) => {
                  const [date, cents, note] = sig.split("|");
                  return (
                    <li key={sig} className="flex items-center justify-between text-sm gap-2">
                      <span className="truncate">
                        {date} · {settings.currency}
                        {(Number(cents) / 100).toLocaleString()}
                        {note ? ` · ${note}` : ""}
                      </span>
                      <button
                        onClick={() => handleUnignoreDuplicate(sig)}
                        className="text-xs font-medium text-[var(--accent-text)] hover:underline shrink-0"
                      >
                        Flag as duplicate again
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </Card>
      )}

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
