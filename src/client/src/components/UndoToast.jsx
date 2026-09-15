import { X } from "lucide-react";

export default function UndoToast({ message, onUndo, onDismiss }) {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl bg-surface2 border border-mist shadow-soft px-4 py-3 animate-modal-in max-w-[calc(100vw-2rem)]">
      <span className="text-sm text-ink truncate">{message}</span>
      <button
        onClick={onUndo}
        className="shrink-0 text-sm font-semibold text-[var(--accent-text)] hover:underline"
      >
        Undo
      </button>
      <button
        onClick={onDismiss}
        className="shrink-0 text-ink/40 hover:text-ink transition"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
