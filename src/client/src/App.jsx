import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "./context/DataContext.jsx";
import { MonthProvider } from "./context/MonthContext.jsx";
import { getToken, clearToken } from "./lib/api.js";
import AppShell from "./components/layout/AppShell.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import OverviewPage from "./pages/OverviewPage.jsx";
import ExpensesPage from "./pages/ExpensesPage.jsx";
import IncomePage from "./pages/IncomePage.jsx";
import BudgetsPage from "./pages/BudgetsPage.jsx";
import GoalsPage from "./pages/GoalsPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

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
      </MonthProvider>
    </DataProvider>
  );
}
