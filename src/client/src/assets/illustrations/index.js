// Real supplied illustration photography, mapped to the page (or moment) each one was
// art-directed for. These are actual images — never redrawn, never replaced with SVG.
import dashboard from "./dashboard-budget-glance.jpeg";
import expenses from "./expenses-receipts.jpeg";
import expensesEmpty from "./expenses-empty-state.jpeg";
import budget from "./budget-monthly-plan.jpeg";
import income from "./income-received.jpeg";
import wellness from "./wellness-brighter-tomorrow.jpeg";
import goals from "./goals-big-goals.jpeg";
import goalsAdventure from "./goals-adventure.jpeg";
import goalReached from "./goal-reached.jpeg";
import reports from "./reports-spending-overview.jpeg";

export const illustrations = {
  dashboard,
  expenses,
  expensesEmpty,
  budget,
  income,
  wellness,
  goals,
  goalsAdventure,
  goalReached,
  reports,
};

// Each source photo's exact width/height, so it can always be displayed at
// its native aspect ratio — full frame, nothing cropped off. All 10 of the
// current set share the same 1080x1350 (4:5) native shape.
export const illustrationAspect = {
  dashboard: "1080/1350",
  expenses: "1080/1350",
  expensesEmpty: "1080/1350",
  budget: "1080/1350",
  income: "1080/1350",
  wellness: "1080/1350",
  goals: "1080/1350",
  goalsAdventure: "1080/1350",
  goalReached: "1080/1350",
  reports: "1080/1350",
};

// The page heroes' display ratio — deliberately a bit wider than each
// photo's native 1080/1350 (0.8) shape, so the hero reads as a wide banner
// rather than a portrait poster. Every image in this set has its headline
// anchored right at the top edge and the character filling the rest of the
// frame downward, so PageHero's default top-aligned objectPosition crops
// only off the bottom (background/desk clutter), never the headline.
export const HERO_ASPECT = "1080/1200";

// Average pixel color sampled directly off each photo's own left/top edge
// (the seam a hero fades into) — so the panel it sits on blends into colors
// that actually come from the photo, not a generic brand hue guessed to be
// "close enough."
export const illustrationEdgeColor = {
  dashboard: { left: "#3d3f3b", top: "#20303f" },
  expenses: { left: "#38444a", top: "#0c2e7c" },
  budget: { left: "#b4b69a", top: "#fef4e5" },
  income: { left: "#f7cbd2", top: "#fbf2e8" },
  wellness: { left: "#a7916d", top: "#e1ccb0" },
  goals: { left: "#d6c6b1", top: "#e6d3d0" },
  goalsAdventure: { left: "#242b33", top: "#2e384d" },
  reports: { left: "#d8c7af", top: "#f7ccba" },
};
