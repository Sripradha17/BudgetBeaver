import {
  Home,
  ShoppingBasket,
  Lightbulb,
  Gift,
  ShoppingCart,
  Shirt,
  UtensilsCrossed,
  Plane,
  Bus,
  HeartPulse,
  PiggyBank,
  TrendingUp,
  Repeat,
  User,
  MoreHorizontal,
} from "lucide-react";

// A muted, "modern dark UI" palette — same hue families as before so categories stay
// recognizable, but desaturated so the app doesn't read as a wall of bright colors.
export const DEFAULT_CATEGORIES = [
  { id: "rent", label: "Rent", badgeColor: "#7c6a9c", icon: Home },
  { id: "provision", label: "Provision", badgeColor: "#4a8a7d", icon: ShoppingBasket },
  { id: "utility", label: "Utility", badgeColor: "#c9974f", icon: Lightbulb },
  { id: "gift", label: "Gift", badgeColor: "#c97b6e", icon: Gift },
  { id: "grocery", label: "Grocery", badgeColor: "#6b9e6d", icon: ShoppingCart },
  { id: "shopping", label: "Shopping", badgeColor: "#b56b8a", icon: Shirt },
  { id: "eating-out", label: "Eating Out", badgeColor: "#bd6a58", icon: UtensilsCrossed },
  { id: "travel", label: "Travel", badgeColor: "#5490ab", icon: Plane },
  { id: "transport", label: "Transport", badgeColor: "#5f7a9e", icon: Bus },
  { id: "health", label: "Health", badgeColor: "#a15048", icon: HeartPulse },
  { id: "savings", label: "Savings", badgeColor: "#5a9188", icon: PiggyBank, isFloorGoal: true },
  { id: "investment", label: "Investment", badgeColor: "#5c8f60", icon: TrendingUp, isFloorGoal: true },
  { id: "subscriptions", label: "Subscriptions", badgeColor: "#8067a0", icon: Repeat },
  { id: "personal", label: "Personal", badgeColor: "#c48752", icon: User },
  { id: "others", label: "Others", badgeColor: "#7d8590", icon: MoreHorizontal },
];

const FALLBACK_COLORS = [
  "#c97b6e", "#4a8a7d", "#c9974f", "#7c6a9c", "#6b9e6d",
  "#5490ab", "#b56b8a", "#a15048", "#8067a0", "#5f7a9e",
];

export function colorForNewCategory(existingCount) {
  return FALLBACK_COLORS[existingCount % FALLBACK_COLORS.length];
}

// Stable position of a category within the full list — used to pick a
// shade off the current page's accent color for that category, so the same
// category always renders the same shade within one page.
export function categoryIndex(allCategories, id) {
  const idx = allCategories.findIndex((c) => c.id === id);
  return idx < 0 ? 0 : idx;
}

export function mergeCategories(customCategories) {
  const custom = customCategories.map((c) => ({ ...c, icon: MoreHorizontal, isCustom: true }));
  return [...DEFAULT_CATEGORIES, ...custom];
}

function stem(word) {
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function normalizeForMatch(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const FILLER_WORDS = new Set(["in", "us", "the", "a", "an", "of", "and", "for", "on", "at"]);

// Matches plurals/case/punctuation variants of the SAME name (e.g. "Gifts" -> "Gift",
// "Eating out" -> "Eating Out"), but deliberately stays strict about compound names that
// merely contain a category word — "India Investment" should stay distinct from "Investment",
// and "India travel provision" should never silently land in the generic "Provision" bucket.
// A wrong merge here isn't just a mis-tagged row, it corrupts a shared budget or hides real
// spending inside an unrelated category, so ambiguous names always fall through to "+ New
// category" in the import review screen instead of guessing.
export function findCategoryByNameExact(allCategories, name) {
  if (!name) return null;
  const normalized = name.trim().toLowerCase();

  const exact =
    allCategories.find((c) => c.label.toLowerCase() === normalized) ||
    allCategories.find((c) => c.id.toLowerCase() === normalized);
  if (exact) return exact;

  const inputStems = new Set(
    normalizeForMatch(name)
      .split(" ")
      .filter((w) => w && !FILLER_WORDS.has(w))
      .map(stem)
  );
  if (inputStems.size === 0) return null;

  return (
    allCategories.find((c) => {
      const labelStems = new Set(
        normalizeForMatch(c.label)
          .split(" ")
          .filter(Boolean)
          .map(stem)
      );
      if (labelStems.size !== inputStems.size) return false;
      for (const w of labelStems) if (!inputStems.has(w)) return false;
      return true;
    }) || null
  );
}
