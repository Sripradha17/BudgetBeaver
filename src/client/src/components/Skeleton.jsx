// Shimmering placeholder blocks shown while DataContext's initial fetch is in
// flight, shaped to echo the hero + stat-tile + card layout every page uses
// so the loading moment doesn't read as a jarring blank flash.

export function SkeletonBlock({ className = "", style }) {
  return <div className={`skeleton-shimmer rounded-lg ${className}`} style={style} />;
}

export function SkeletonCard({ className = "" }) {
  return (
    <div className={`rounded-[1.75rem] border border-mist/60 bg-white/70 p-4 ${className}`}>
      <SkeletonBlock className="h-4 w-1/3 mb-3" />
      <SkeletonBlock className="h-3 w-full mb-2" />
      <SkeletonBlock className="h-3 w-2/3" />
    </div>
  );
}

export default function PageSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading your finances">
      <SkeletonBlock className="w-full rounded-[1.75rem]" style={{ aspectRatio: "1080/1200", maxHeight: 260 }} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} className="h-24" />
        ))}
      </div>
      <SkeletonCard className="h-44" />
      <SkeletonCard className="h-44" />
    </div>
  );
}
