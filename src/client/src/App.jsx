import { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "./context/DataContext.jsx";
import { MonthProvider } from "./context/MonthContext.jsx";
import { getToken, clearToken } from "./lib/api.js";
import AppShell from "./components/layout/AppShell.jsx";
import PageSkeleton from "./components/Skeleton.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import HomePage from "./pages/HomePage.jsx";

// Everything past the first screen loads on demand instead of in the initial
// bundle — Expenses alone pulls in the xlsx import/export library, which is
// most of the app's JS weight, so lazy-loading it (and every other page)
// cuts what has to download+parse before the Home page can render.
const OverviewPage = lazy(() => import("./pages/OverviewPage.jsx"));
const ExpensesPage = lazy(() => import("./pages/ExpensesPage.jsx"));
const IncomePage = lazy(() => import("./pages/IncomePage.jsx"));
const BudgetsPage = lazy(() => import("./pages/BudgetsPage.jsx"));
const GoalsPage = lazy(() => import("./pages/GoalsPage.jsx"));
const ReportsPage = lazy(() => import("./pages/ReportsPage.jsx"));
const SettingsPage = lazy(() => import("./pages/SettingsPage.jsx"));

export default function App() {
  const [authed, setAuthed] = useState(() => !!getToken());

  useEffect(() => {
    function handleUnauthorized() {
      clearToken();
      setAuthed(false);
    }
    window.addEventListener("budget-beaver:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("budget-beaver:unauthorized", handleUnauthorized);
  }, []);

  if (!authed) {
    return <LoginPage onLoggedIn={() => setAuthed(true)} />;
  }

  const onLogout = () => setAuthed(false);

  return (
    <DataProvider>
      <MonthProvider>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route element={<AppShell onLogout={onLogout} />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/income" element={<IncomePage />} />
              <Route path="/budget" element={<BudgetsPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage onLogout={onLogout} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </MonthProvider>
    </DataProvider>
  );
}
