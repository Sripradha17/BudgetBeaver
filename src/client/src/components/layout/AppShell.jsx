import { Outlet, useLocation } from "react-router-dom";
import { useData } from "../../context/DataContext.jsx";
import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";
import MobileBottomNav from "./MobileBottomNav.jsx";
import { pageTheme, routeTheme, themeVars } from "../../theme/pageTheme.js";

export default function AppShell({ onLogout }) {
  const { loading, error } = useData();
  const location = useLocation();
  const theme = pageTheme[routeTheme[location.pathname]] || pageTheme.dashboard;

  return (
    <div className="min-h-screen transition-colors duration-300" style={themeVars(theme)}>
      <Sidebar onLogout={onLogout} />
      <div className="flex min-h-screen flex-col lg:pl-[var(--nav-sidebar-w)]">
        <TopBar />
        <main
          className="flex-1 w-full px-4 py-5 pb-[calc(var(--bottom-nav-h)+1rem)] transition-[background] duration-300 sm:px-6 lg:px-8 lg:pb-8"
          style={{
            background:
              "radial-gradient(1100px 620px at 50% 0%, color-mix(in srgb, var(--accent) 32%, var(--page-wash)) 0%, var(--page-wash) 55%, var(--page-wash) 100%)",
          }}
        >
          <div className="mx-auto max-w-content">
            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 text-sm">
                {error}
              </div>
            )}
            {loading ? (
              <p className="text-center text-ink/50 py-10">Loading your finances…</p>
            ) : (
              <div key={location.pathname} className="animate-page-in">
                <Outlet />
              </div>
            )}
          </div>
        </main>
      </div>
      <MobileBottomNav onLogout={onLogout} />
    </div>
  );
}
