import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMonth } from "../context/MonthContext.jsx";

export default function MonthNavigator() {
  const { label, isCurrentMonth, goToPrevMonth, goToNextMonth, goToCurrentMonth } = useMonth();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={goToPrevMonth}
        className="rounded-full p-1.5 text-[var(--shell-text)] transition hover:opacity-80"
        style={{ backgroundColor: "color-mix(in srgb, var(--shell-text) 12%, transparent)" }}
        aria-label="Previous month"
      >
        <ChevronLeft size={20} />
      </button>
      <div className="flex flex-col items-center min-w-[140px]">
        <span className="font-display font-bold text-lg leading-tight text-[var(--shell-text)]">{label}</span>
        {!isCurrentMonth && (
          <button
            onClick={goToCurrentMonth}
            className="text-xs underline hover:opacity-80"
            style={{ color: "color-mix(in srgb, var(--shell-text) 65%, transparent)" }}
          >
            jump to current month
          </button>
        )}
      </div>
      <button
        onClick={goToNextMonth}
        className="rounded-full p-1.5 text-[var(--shell-text)] transition hover:opacity-80"
        style={{ backgroundColor: "color-mix(in srgb, var(--shell-text) 12%, transparent)" }}
        aria-label="Next month"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
