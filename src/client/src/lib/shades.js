// Every color-bearing element (category badges, status bars, chart lines)
// renders as a shade of the CURRENT PAGE's single accent color instead of
// its own fixed hue, so distinguishability comes from lightness/darkness
// rather than different colors. Built on CSS color-mix() against the
// --accent custom property, so the same ramp automatically follows
// whichever page (and therefore accent) it's rendered under.
//
// Every "white" step keeps at least 70% of the original accent (at most 30%
// white mixed in) and every "black" step keeps at least 40% — anything
// paler than that measured as too low-contrast to read as an icon/badge
// foreground against a card (e.g. a category icon that all but disappeared
// against its own card background).
const RAMP = [
  { toward: "white", amt: 88 },
  { toward: "black", amt: 55 },
  { toward: "white", amt: 72 },
  { toward: "black", amt: 75 },
  { toward: "white", amt: 95 },
  { toward: "black", amt: 42 },
  { toward: "white", amt: 80 },
  { toward: "black", amt: 65 },
  { toward: "white", amt: 78 },
  { toward: "black", amt: 90 },
];

function step(index) {
  const i = ((index % RAMP.length) + RAMP.length) % RAMP.length;
  return RAMP[i];
}

// A solid, opaque shade suitable for icon fills, bars, dots.
export function shadeCss(index) {
  const s = step(index);
  return `color-mix(in srgb, var(--accent) ${s.amt}%, ${s.toward})`;
}

// A translucent wash of that same shade, for icon-circle backgrounds etc.
export function shadeWashCss(index, alphaPct = 18) {
  return `color-mix(in srgb, ${shadeCss(index)} ${alphaPct}%, transparent)`;
}

// Every step keeps at least 70% of the (always medium-to-dark, saturated)
// page accent, so white text/icons read cleanly on top of any of them —
// unlike a pale wash, there's no step light enough to need dark text instead.
export function shadeTextColor() {
  return "#ffffff";
}
