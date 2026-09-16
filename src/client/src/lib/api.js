// In production (GitHub Pages) the client and server are on different origins, so the
// build needs an absolute API URL — set via the VITE_API_URL secret in the deploy workflow.
// Local dev has no VITE_API_URL, so it falls back to the relative path Vite proxies to
// localhost:5000 (see vite.config.js).
const BASE = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "budget_beaver_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Reads the email straight out of the JWT payload for display purposes only
// (no signature check needed client-side — the server verifies on every
// request). Tokens issued before the payload carried an email fall back to
// null gracefully instead of throwing.
function getTokenPayload() {
  const token = getToken();
  if (!token) return null;
  try {
    const payloadPart = token.split(".")[1];
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/").padEnd(payloadPart.length + ((4 - (payloadPart.length % 4)) % 4), "=");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function getCurrentUserEmail() {
  return getTokenPayload()?.email || null;
}

// Per-user display name (e.g. for "Good morning, X" greetings) — distinct
// from settings.myLabel/spouseLabel, which are shared household-wide labels
// used to tag who an expense/income entry belongs to.
export function getCurrentUserName() {
  return getTokenPayload()?.name || null;
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (res.status === 401) {
    clearToken();
    window.dispatchEvent(new Event("budget-beaver:unauthorized"));
    throw new Error("Not logged in");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function authRequest(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Request failed: ${res.status}`);
  }
  const { token } = await res.json();
  setToken(token);
  return token;
}

export const api = {
  login: (email, password) => authRequest("/login", { email, password }),
  signup: (email, password, inviteCode, name) => authRequest("/signup", { email, password, inviteCode, name }),
  updateProfile: async (name) => {
    const { token } = await request("/me", { method: "PUT", body: JSON.stringify({ name }) });
    setToken(token);
    return getCurrentUserName();
  },

  getHousehold: () => request("/household"),
  regenerateInvite: () => request("/household/regenerate-invite", { method: "POST" }),
  removeMember: (userId) => request(`/household/members/${userId}`, { method: "DELETE" }),

  getExpenses: () => request("/expenses"),
  createExpense: (data) => request("/expenses", { method: "POST", body: JSON.stringify(data) }),
  bulkCreateExpenses: (rows) =>
    request("/expenses/bulk", { method: "POST", body: JSON.stringify({ rows }) }),
  updateExpense: (id, data) =>
    request(`/expenses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: "DELETE" }),

  getIncome: () => request("/income"),
  createIncome: (data) => request("/income", { method: "POST", body: JSON.stringify(data) }),
  bulkCreateIncome: (rows) =>
    request("/income/bulk", { method: "POST", body: JSON.stringify({ rows }) }),
  updateIncome: (id, data) => request(`/income/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteIncome: (id) => request(`/income/${id}`, { method: "DELETE" }),

  getSettings: () => request("/settings"),
  updateSettings: (data) => request("/settings", { method: "PUT", body: JSON.stringify(data) }),

  getCategories: () => request("/categories"),
  createCategory: (data) => request("/categories", { method: "POST", body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: "DELETE" }),

  resetAll: () => request("/reset", { method: "POST" }),

  getGoals: () => request("/goals"),
  createGoal: (data) => request("/goals", { method: "POST", body: JSON.stringify(data) }),
  updateGoal: (id, data) => request(`/goals/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteGoal: (id) => request(`/goals/${id}`, { method: "DELETE" }),

  subscribePush: (subscription) =>
    request("/push/subscribe", { method: "POST", body: JSON.stringify({ subscription }) }),
  unsubscribePush: (endpoint) =>
    request("/push/unsubscribe", { method: "POST", body: JSON.stringify({ endpoint }) }),
};
