// Each page's accent palette is derived from the dominant hue sampled out of
// that page's own hero photo (a hue-bucket histogram over the image,
// excluding near-neutral pixels). Login's two variants come from the
// about_page.gif's own primary (raccoon green) and secondary (coin gold)
// colors. pageWash/tileBg/cardBorder are deliberately saturated enough to
// read as "this page is blue/gold/teal" at a glance, not just an off-white
// hint — cardBg stays near-white so text on cards keeps full contrast.
export const pageTheme = {
  // Dashboard is a dark shell (page background + nav match the hero photo's
  // own dark navy) with lighter card/tile surfaces floating on top, a
  // slightly brighter accent so buttons pop against the dark ground, and a
  // deeper shade for the chart bar so it reads clearly against its lighter card.
  dashboard: {
    accent: "#2668d9",
    accentHover: "#2159ba",
    text: "#224177",
    ring: "#3c77dd",
    cardBg: "#dae2f1",
    cardBorder: "#aec0e0",
    pageWash: "#152237",
    tileBg: "#d3ddee",
    tileBorder: "#a3b8dc",
    shellText: "#dee7f7",
    graphColor: "#1d4387",
    heroCorner: "#152237",
  },
  // Overview has no hero photo of its own — its color comes from the raccoon
  // mascot's own green ("Safe to spend" card), same dark-shell treatment as
  // Dashboard: dark green shell + nav, lighter green cards/tiles on top.
  overview: {
    accent: "#24a887",
    accentHover: "#1d8b6f",
    text: "#1e6755",
    ring: "#29c29b",
    cardBg: "#dbf0eb",
    cardBorder: "#b0ddd2",
    pageWash: "#15372f",
    tileBg: "#d4ede7",
    tileBorder: "#a6d9cc",
    shellText: "#e1f4ef",
    graphColor: "#1f7a63",
    heroCorner: "#15372f",
  },
  // Same navy family as Dashboard (its own image samples to the same blue),
  // so it gets the same dark-shell treatment: dark shell + nav, lighter
  // blue cards/tiles floating on top, brighter accent for buttons.
  expenses: {
    accent: "#2668d9",
    accentHover: "#2159ba",
    text: "#224177",
    ring: "#3c77dd",
    cardBg: "#dae2f1",
    cardBorder: "#aec0e0",
    pageWash: "#152237",
    tileBg: "#d3ddee",
    tileBorder: "#a3b8dc",
    shellText: "#dee7f7",
    graphColor: "#1d4387",
    heroCorner: "#152237",
  },
  // Dark-shell treatment like Dashboard/Overview/Expenses/Income, using the
  // orangish-red from the budget photo (leaned slightly redder than a plain
  // gold so it reads as "orangish" rather than amber).
  budget: {
    accent: "#d57c15",
    accentHover: "#b06611",
    text: "#764a19",
    ring: "#e98b20",
    cardBg: "#f1e6da",
    cardBorder: "#e0c9ae",
    pageWash: "#392813",
    tileBg: "#eee1d3",
    tileBorder: "#dcc1a3",
    shellText: "#f5ebe0",
    graphColor: "#8c5617",
    heroCorner: "#392813",
  },
  // Income has two hero photos (teal "Bills paid" up top, warm-toned
  // "breathe easier tomorrow" further down) — both share this one teal
  // accent/background, same single-color approach as every other page.
  income: {
    accent: "#18a8bf",
    accentHover: "#148c9f",
    text: "#17626d",
    ring: "#1bc0da",
    cardBg: "#daeef1",
    cardBorder: "#aed9e0",
    pageWash: "#133439",
    tileBg: "#d3eaee",
    tileBorder: "#a3d4dc",
    shellText: "#e0f2f5",
    graphColor: "#177482",
    heroCorner: "#133439",
  },
  // Dark-shell treatment using the burgundy/violet from the goals photo's
  // cardigan and wall — the algorithmic sampler had leaned toward the warm
  // wood/skin tones instead, so this hue is picked by eye rather than sampled.
  goals: {
    accent: "#a63075",
    accentHover: "#86275f",
    text: "#6b244d",
    ring: "#be3786",
    cardBg: "#f0e0e9",
    cardBorder: "#debacf",
    pageWash: "#3a182c",
    tileBg: "#edd9e5",
    tileBorder: "#d7acc5",
    shellText: "#f3e2ec",
    graphColor: "#7a1f54",
    heroCorner: "#3a182c",
  },
  // Dark-shell treatment, leaned to a clearer vivid orange (rather than the
  // more muted terracotta first sampled) to match the photo's pie-chart/
  // saree orange more directly.
  reports: {
    accent: "#e26612",
    accentHover: "#bd550f",
    text: "#7e431b",
    ring: "#ed7626",
    cardBg: "#f2e6de",
    cardBorder: "#e2c5b1",
    pageWash: "#3d2514",
    tileBg: "#f0e0d6",
    tileBorder: "#ddbca6",
    shellText: "#f5e9e0",
    graphColor: "#8f4514",
    heroCorner: "#3d2514",
  },
  // Same deep-navy family as Dashboard/Expenses (its own image is also a
  // dark navy night scene) — dark shell + nav, lighter blue cards on top.
  settings: {
    accent: "#2668d9",
    accentHover: "#2159ba",
    text: "#224177",
    ring: "#3c77dd",
    cardBg: "#dae2f1",
    cardBorder: "#aec0e0",
    pageWash: "#152237",
    tileBg: "#d3ddee",
    tileBorder: "#a3b8dc",
    shellText: "#dee7f7",
    graphColor: "#1d4387",
    heroCorner: "#152237",
  },
  loginSignIn: {
    accent: "#36a15f",
    accentHover: "#2d864f",
    text: "#2a6f44",
    ring: "#3bb068",
    cardBg: "#fafbfa",
    cardBorder: "#c9e3d3",
    pageWash: "#e0eee5",
    tileBg: "#d6ebde",
    tileBorder: "#b6d8c3",
    heroCorner: "#123322",
  },
  loginSignUp: {
    accent: "#bf8118",
    accentHover: "#9f6c14",
    text: "#825b17",
    ring: "#d18e1a",
    cardBg: "#fbfbf9",
    cardBorder: "#eadbc3",
    pageWash: "#f1eadc",
    tileBg: "#f1e5d0",
    tileBorder: "#e1cead",
    heroCorner: "#372910",
  },
};

// route pathname -> pageTheme key
export const routeTheme = {
  "/": "dashboard",
  "/overview": "overview",
  "/expenses": "expenses",
  "/budget": "budget",
  "/income": "income",
  "/goals": "goals",
  "/reports": "reports",
  "/settings": "settings",
};

export function themeVars(t) {
  return {
    "--accent": t.accent,
    "--accent-hover": t.accentHover,
    "--accent-text": t.text,
    "--accent-ring": t.ring,
    "--card-bg": t.cardBg,
    "--card-border": t.cardBorder,
    "--page-wash": t.pageWash,
    "--tile-bg": t.tileBg,
    "--tile-border": t.tileBorder,
    "--shell-text": t.shellText || t.text,
    "--hero-corner": t.heroCorner || t.pageWash,
  };
}
