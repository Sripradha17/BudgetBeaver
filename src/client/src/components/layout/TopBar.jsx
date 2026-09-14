import { useLocation } from "react-router-dom";
import mascot from "../../assets/illustrations/mascot.jpg";
import MonthNavigator from "../MonthNavigator.jsx";
import { NAV_ITEMS } from "./navItems.js";

// Pages whose numbers are scoped to a specific month get the month switcher; the rest
// (Home, Goals, Reports, Settings) show all-time or point-in-time data.
const MONTH_SCOPED_PATHS = new Set(["/overview", "/expenses", "/income", "/budget"]);

export default function TopBar() {
  const location = useLocation();
  const active = NAV_ITEMS.find((item) => (item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path)));
  const title = active?.label || "Budget Raccoon";
  const isHome = location.pathname === "/";
  const showMonth = MONTH_SCOPED_PATHS.has(location.pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-surface/90 backdrop-blur">
      <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          {isHome && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg overflow-hidden lg:hidden">
              <img src={mascot} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          <h1 className="truncate font-display text-lg font-extrabold text-ink lg:text-xl">{title}</h1>
        </div>
        {showMonth && <MonthNavigator />}
      </div>
    </header>
  );
}
