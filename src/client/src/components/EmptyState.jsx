import PhotoBanner from "./PhotoBanner.jsx";

// Standard "nothing here yet" treatment: the same illustrated-photo language
// as every hero/banner on the page, so an empty page still feels designed
// rather than broken.
export default function EmptyState({ image, aspect, tint = "forest", message, className = "" }) {
  return (
    <div className={`flex flex-col items-center gap-3 py-4 text-center ${className}`}>
      <PhotoBanner src={image} tint={tint} aspect={aspect} className="w-full max-w-[500px]" />
      <p className="text-ink/50 text-sm">{message}</p>
    </div>
  );
}
