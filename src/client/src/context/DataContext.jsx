import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";
import { mergeCategories } from "../lib/categories.js";
import { oneTimeBudgetKey } from "../lib/budgets.js";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [goals, setGoals] = useState([]);
  const [settings, setSettings] = useState({
    currency: "$",
    baseCurrencyCode: "USD",
    myLabel: "Sripradha",
    spouseLabel: "Sudheendra",
    budgets: {},
    oneTimeBudgets: {},
    ignoredDuplicateSignatures: [],
    dismissedRecurringMonths: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [expensesData, incomeData, categoriesData, settingsData, goalsData] = await Promise.all([
        api.getExpenses(),
        api.getIncome(),
        api.getCategories(),
        api.getSettings(),
        api.getGoals(),
      ]);
      setExpenses(expensesData);
      setIncome(incomeData);
      setCustomCategories(categoriesData);
      setGoals(goalsData);
      setSettings({
        currency: settingsData.currency,
        baseCurrencyCode: settingsData.baseCurrencyCode || "USD",
        myLabel: settingsData.myLabel,
        spouseLabel: settingsData.spouseLabel,
        budgets: settingsData.budgets || {},
        oneTimeBudgets: settingsData.oneTimeBudgets || {},
        ignoredDuplicateSignatures: settingsData.ignoredDuplicateSignatures || [],
        dismissedRecurringMonths: settingsData.dismissedRecurringMonths || [],
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const categories = useMemo(() => mergeCategories(customCategories), [customCategories]);

  const addExpense = useCallback(async (data) => {
    const created = await api.createExpense(data);
    setExpenses((prev) => [created, ...prev]);
  }, []);

  const bulkAddExpenses = useCallback(async (rows) => {
    const created = await api.bulkCreateExpenses(rows);
    setExpenses((prev) => [...created, ...prev]);
    return created;
  }, []);

  const updateExpense = useCallback(async (id, data) => {
    const updated = await api.updateExpense(id, data);
    setExpenses((prev) => prev.map((e) => (e._id === id ? updated : e)));
    return updated;
  }, []);

  const removeExpense = useCallback(async (id) => {
    await api.deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e._id !== id));
  }, []);

  const addIncome = useCallback(async (data) => {
    const created = await api.createIncome(data);
    setIncome((prev) => [created, ...prev]);
  }, []);

  const bulkAddIncome = useCallback(async (rows) => {
    const created = await api.bulkCreateIncome(rows);
    setIncome((prev) => [...created, ...prev]);
  }, []);

  const updateIncome = useCallback(async (id, data) => {
    const updated = await api.updateIncome(id, data);
    setIncome((prev) => prev.map((i) => (i._id === id ? updated : i)));
    return updated;
  }, []);

  const removeIncome = useCallback(async (id) => {
    await api.deleteIncome(id);
    setIncome((prev) => prev.filter((i) => i._id !== id));
  }, []);

  const addCategory = useCallback(async (data) => {
    const created = await api.createCategory(data);
    setCustomCategories((prev) => [...prev, created]);
  }, []);

  const removeCategory = useCallback(async (id) => {
    await api.deleteCategory(id);
    setCustomCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateSettings = useCallback(async (partial) => {
    const updated = await api.updateSettings({ ...settings, ...partial });
    setSettings({
      currency: updated.currency,
      baseCurrencyCode: updated.baseCurrencyCode || "USD",
      myLabel: updated.myLabel,
      spouseLabel: updated.spouseLabel,
      budgets: updated.budgets || {},
      oneTimeBudgets: updated.oneTimeBudgets || {},
      ignoredDuplicateSignatures: updated.ignoredDuplicateSignatures || [],
      dismissedRecurringMonths: updated.dismissedRecurringMonths || [],
    });
  }, [settings]);

  // Pass a monthKey to set a one-off budget for just that month instead of the
  // recurring monthly amount.
  const setBudget = useCallback(
    async (categoryId, amount, monthKey = null) => {
      if (monthKey) {
        const nextOneTime = {
          ...settings.oneTimeBudgets,
          [oneTimeBudgetKey(monthKey, categoryId)]: amount,
        };
        await updateSettings({ oneTimeBudgets: nextOneTime });
      } else {
        const nextBudgets = { ...settings.budgets, [categoryId]: amount };
        await updateSettings({ budgets: nextBudgets });
      }
    },
    [settings.budgets, settings.oneTimeBudgets, updateSettings]
  );

  const resetAll = useCallback(async () => {
    await api.resetAll();
    await refreshAll();
  }, [refreshAll]);

  const addGoal = useCallback(async (data) => {
    const created = await api.createGoal(data);
    setGoals((prev) => [created, ...prev]);
  }, []);

  const updateGoal = useCallback(async (id, data) => {
    const updated = await api.updateGoal(id, data);
    setGoals((prev) => prev.map((g) => (g._id === id ? updated : g)));
    return updated;
  }, []);

  const removeGoal = useCallback(async (id) => {
    await api.deleteGoal(id);
    setGoals((prev) => prev.filter((g) => g._id !== id));
  }, []);

  const value = {
    expenses,
    income,
    categories,
    customCategories,
    goals,
    settings,
    loading,
    error,
    addExpense,
    bulkAddExpenses,
    updateExpense,
    removeExpense,
    addIncome,
    bulkAddIncome,
    updateIncome,
    removeIncome,
    addCategory,
    removeCategory,
    updateSettings,
    setBudget,
    resetAll,
    refreshAll,
    addGoal,
    updateGoal,
    removeGoal,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
