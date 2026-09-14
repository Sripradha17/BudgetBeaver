// A single, consistent way to feature a supplied photo as the highlight of a
// page: the full photo (via the `aspect` prop — nothing cropped) dissolves
// into whatever it's sitting on via a mask gradient, with no rounded-rect
// border, ring, or drop shadow. This only truly disappears when the photo
// sits inside a same-colored panel with real padding around it (see
// PageHero) — fading straight onto a differently-colored page edge-to-edge
// still reads as a hard seam no matter how soft the gradient is.
const TINTS = {
  forest: "bg-forest",
  coral: "bg-coral",
  gold: "bg-gold",
  plum: "bg-plum",
  teal: "bg-teal",
};

const FADE_MASKS = {
  oval: "radial-gradient(ellipse 100% 100% at 50% 50%, black 38%, rgba(0,0,0,0.75) 60%, transparent 96%)",
};

export default function PhotoBanner({
  src,
  tint = "forest",
  aspect,
  className = "",
  imgClassName = "",
  fade = "oval",
  children,
}) {
  const mask = fade ? FADE_MASKS[fade] : null;
  return (
    // `aspect` locks the box to the photo's own width/height so the full
    // image always fits — set only a width OR a height on the caller's
    // className, never both, or the aspect ratio has nothing to resolve.
    <div className={`relative ${className}`} style={aspect ? { aspectRatio: aspect } : undefined}>
      <div
        className="absolute inset-0"
        style={mask ? { WebkitMaskImage: mask, maskImage: mask } : undefined}
      >
        <img
          src={src}
          alt=""
          className={`h-full w-full object-contain [filter:saturate(1.08)] ${imgClassName}`}
        />
        <div className={`absolute inset-0 ${TINTS[tint]} opacity-[0.2] mix-blend-soft-light`} />
      </div>
      {children}
    </div>
  );
}
