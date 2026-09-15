export default function CategoryChipPicker({ categories, value, onChange, className = "" }) {
  return (
    <div className={`flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scroll-fade-x ${className}`}>
      {categories.map((c) => {
        const Icon = c.icon;
        const selected = c.id === value;
        return (
          <button
            type="button"
            key={c.id}
            onClick={() => onChange(c.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              selected
                ? "text-white border-transparent shadow-[0_10px_20px_-14px_rgba(0,0,0,0.6)]"
                : "text-ink/60 bg-white/75 border-mist hover:border-ink/25 hover:text-ink"
            }`}
            style={selected ? { backgroundColor: "var(--accent)" } : undefined}
          >
            <Icon size={13} />
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
