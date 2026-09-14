// One consistent hero used at the top of every page. `aspect` sets the
// box's shape (pass HERO_ASPECT for the deliberately-wider-than-native crop,
// or a photo's own illustrationAspect for a zero-crop display); the grid
// column is `auto`-sized to exactly match that box, so there's never
// leftover empty space around it. `objectPosition` keeps the photo's actual
// subject framed inside whatever gets cropped by the mismatch between box
// and native shape. It fades gradually into the panel on the one edge that
// meets the text; the panel's own color is sampled from the photo itself
// (its own edge pixels — see illustrationEdgeColor), not a generic brand
// hue, so the seam is an actual color match rather than just an alpha fade.
function hexToRgb(hex) {
  const v = hex.replace("#", "");
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}
function mixHex(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

const TINT_DARK = {
  forest: "#173a2d",
  coral: "#4a281c",
  gold: "#4a3611",
  teal: "#16333d",
  plum: "#2e2447",
};

const TINTS = {
  forest: "bg-forest",
  coral: "bg-coral",
  gold: "bg-gold",
  plum: "bg-plum",
  teal: "bg-teal",
};

const FADE_TOP = "linear-gradient(to top, black 45%, transparent 100%)";
const FADE_LEFT = "linear-gradient(to right, transparent 0%, black 48%)";

export default function PageHero({
  tint = "forest",
  eyebrow,
  title,
  description,
  image,
  aspect,
  objectPosition = "50% 0%",
  edgeColor,
  className = "",
  children,
  heroHeight = 420,
}) {
  const dark = TINT_DARK[tint];
  const gradH = `linear-gradient(to right, ${dark} 0%, ${mixHex(dark, edgeColor.left, 0.55)} 62%, ${edgeColor.left} 100%)`;
  const gradV = `linear-gradient(to bottom, ${dark} 0%, ${mixHex(dark, edgeColor.top, 0.55)} 58%, ${edgeColor.top} 100%)`;

  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] text-cream shadow-soft lg:h-[var(--hero-h)] ${className}`}
      style={{ "--hero-h": `${heroHeight}px` }}
    >
      {/* The panel's own background — color-matched to the photo, so the
          fade never has to bridge an unrelated hue. */}
      <div className="absolute inset-0 lg:hidden" style={{ background: gradV }} />
      <div className="absolute inset-0 hidden lg:block" style={{ background: gradH }} />

      <div className="relative grid lg:h-full lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="relative z-10 flex flex-col justify-center gap-4 p-6 sm:p-8 lg:py-10">
          <div>
            {eyebrow && (
              <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-white/60">{eyebrow}</p>
            )}
            <h1 className="mt-1 font-display text-[1.7rem] font-extrabold leading-[1.1] sm:text-[2.1rem]">{title}</h1>
            {description && <p className="mt-2 max-w-sm text-sm text-white/65">{description}</p>}
          </div>
          {children}
        </div>

        {/* Mobile/tablet: full width, height set by the photo's own aspect
            ratio — the whole photo, exactly filling its box, at any screen
            width, with no breakpoint jumps. Fades up into the text above. */}
        <div className="relative w-full lg:hidden" style={{ aspectRatio: aspect }}>
          <div className="absolute inset-0" style={{ WebkitMaskImage: FADE_TOP, maskImage: FADE_TOP }}>
            <img
              src={image}
              alt=""
              className="h-full w-full object-cover [filter:saturate(1.05)]"
              style={{ objectPosition }}
            />
            <div className={`absolute inset-0 ${TINTS[tint]} opacity-[0.14] mix-blend-soft-light`} />
          </div>
        </div>

        {/* Desktop: full height, width set by the same aspect ratio — the
            grid column is `auto`, so it's sized to exactly match that
            computed width. No crop, and no leftover gap either. Fades left
            into the text beside it. */}
        <div className="hidden lg:flex lg:h-full lg:items-center lg:justify-end">
          <div className="relative h-full" style={{ aspectRatio: aspect }}>
            <div className="absolute inset-0" style={{ WebkitMaskImage: FADE_LEFT, maskImage: FADE_LEFT }}>
              <img
                src={image}
                alt=""
                className="h-full w-full object-cover [filter:saturate(1.05)]"
                style={{ objectPosition }}
              />
              <div className={`absolute inset-0 ${TINTS[tint]} opacity-[0.14] mix-blend-soft-light`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
