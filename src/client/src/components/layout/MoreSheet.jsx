import { NavLink } from "react-router-dom";
import { X, LogOut } from "lucide-react";
import { NAV_ITEMS, MOBILE_MORE_IDS } from "./navItems.js";
import { clearToken } from "../../lib/api.js";

// Mobile-only slide-up sheet for the nav items that don't fit in the bottom bar.
// Reuses the modal/backdrop keyframes already defined in index.css for the desktop modals.
export default function MoreSheet({ onClose, onLogout }) {
  const items = NAV_ITEMS.filter((item) => MOBILE_MORE_IDS.includes(item.id));

  return (
    <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="More navigation">
      <div className="absolute inset-0 bg-ink/40 animate-backdrop-in" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 rounded-t-[1.75rem] bg-surface p-3 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-raised animate-modal-in">
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-mist" />
        <div className="flex items-center justify-between px-2 pb-2">
          <span className="font-display text-sm font-bold text-ink">More</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink/50 hover:bg-mist/60 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>
        <nav className="space-y-0.5">
          {items.map(({ id, label, icon: Icon, path }) => (
            <NavLink
              key={id}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${
                  isActive ? "bg-[var(--accent)] text-white" : "text-ink/75 hover:bg-[var(--tile-bg)]"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          <button
            onClick={() => {
              clearToken();
              onLogout();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-ink/60 hover:bg-sage-light"
          >
            <LogOut size={18} className="text-ink/40" /> Log out
          </button>
        </nav>
      </div>
    </div>
  );
}
