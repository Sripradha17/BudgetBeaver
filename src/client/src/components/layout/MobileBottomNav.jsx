import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { NAV_ITEMS, MOBILE_PRIMARY_IDS, MOBILE_MORE_IDS } from "./navItems.js";
import MoreSheet from "./MoreSheet.jsx";

export default function MobileBottomNav({ onLogout }) {
  const [showMore, setShowMore] = useState(false);
  const location = useLocation();

  const primaryItems = MOBILE_PRIMARY_IDS.map((id) => NAV_ITEMS.find((item) => item.id === id));
  const moreIsActive = MOBILE_MORE_IDS.some((id) => {
    const item = NAV_ITEMS.find((n) => n.id === id);
    return item && location.pathname.startsWith(item.path);
  });

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-[color-mix(in_srgb,var(--shell-text)_15%,transparent)] backdrop-blur pb-[env(safe-area-inset-bottom)] lg:hidden transition-colors duration-300"
        style={{ backgroundColor: "color-mix(in srgb, var(--page-wash) 95%, transparent)" }}
        aria-label="Primary"
      >
        {primaryItems.map(({ id, label, icon: Icon, path }) => (
          <NavLink
            key={id}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
                isActive
                  ? "text-[var(--accent)]"
                  : "text-[color-mix(in_srgb,var(--shell-text)_55%,transparent)]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
        <button
          onClick={() => setShowMore(true)}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
            moreIsActive ? "text-[var(--accent)]" : "text-[color-mix(in_srgb,var(--shell-text)_55%,transparent)]"
          }`}
          aria-haspopup="dialog"
          aria-expanded={showMore}
        >
          <MoreHorizontal size={20} strokeWidth={moreIsActive ? 2.4 : 2} />
          More
        </button>
      </nav>
      {showMore && <MoreSheet onClose={() => setShowMore(false)} onLogout={onLogout} />}
    </>
  );
}
