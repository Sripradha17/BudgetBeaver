import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import mascot from "../../assets/illustrations/mascot.jpg";
import { NAV_ITEMS } from "./navItems.js";
import { clearToken } from "../../lib/api.js";

export default function Sidebar({ onLogout }) {
  return (
    <aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 bottom-0 w-[264px] border-r border-mist bg-surface z-30">
      <NavLink to="/" className="flex items-center gap-3 px-6 pt-6 pb-5 text-left">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl overflow-hidden">
          <img src={mascot} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <span className="block font-display text-[15px] font-bold leading-tight text-ink">Budget Raccoon</span>
          <span className="block text-[11px] font-medium text-ink/45">Personal finance</span>
        </div>
      </NavLink>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto" aria-label="Primary">
        {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => (
          <NavLink
            key={id}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-forest text-white" : "text-ink/65 hover:bg-sage-light hover:text-ink"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={2} className={isActive ? "text-white" : "text-ink/45 group-hover:text-forest"} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-5 pt-2 border-t border-mist">
        <button
          onClick={() => {
            clearToken();
            onLogout();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink/55 hover:bg-sage-light hover:text-ink"
        >
          <LogOut size={17} className="text-ink/40" /> Log out
        </button>
      </div>
    </aside>
  );
}
