import { useState } from "react";
import { api } from "../lib/api.js";
import aboutIntroGif from "../assets/illustrations/about_page.gif";

export default function LoginPage({ onLoggedIn }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (mode === "login") {
        await api.login(email, password);
      } else {
        await api.signup(email, password);
      }
      onLoggedIn();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-5 py-4 md:grid-cols-[minmax(0,0.95fr)_minmax(19rem,23rem)] lg:min-h-[calc(100vh-2.5rem)] lg:gap-8 lg:py-0">
        <div className="flex min-w-0 flex-col items-center gap-4 text-center md:items-start md:text-left lg:gap-5">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/72 px-4 py-2 shadow-[0_18px_40px_-28px_rgba(90,76,118,0.45)] backdrop-blur">
            <span className="h-2.5 w-2.5 rounded-full bg-coral shadow-[0_0_0_7px_rgba(255,154,118,0.18)]" />
            <div>
              <span className="block font-display text-[1.18rem] font-extrabold leading-none text-ink sm:text-[1.35rem]">
                Budget Raccoon
              </span>
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.24em] text-coral/80">
                Personal finance
              </span>
            </div>
          </div>
          <div className="max-w-xl space-y-2.5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-ink/45 sm:text-[11px]">Overview</p>
            <h1 className="max-w-[11ch] text-[1.6rem] leading-[0.96] text-ink sm:text-[1.9rem] md:text-[2.15rem] lg:text-[2.75rem]">
              Clear budgeting, softer interface.
            </h1>
            <p className="mx-auto max-w-md text-[12px] leading-5 text-ink/68 sm:text-[13px] md:mx-0 md:max-w-[34rem] md:text-sm lg:text-[15px] lg:leading-6">
              Track spending, bills, and savings with a lighter visual style and concise summaries.
            </p>
          </div>
          <div className="w-full max-w-md overflow-hidden rounded-[1.65rem] border border-white/70 shadow-[0_30px_70px_-42px_rgba(67,54,87,0.38)] md:max-w-[30rem] lg:max-w-[34rem]">
            <img
              src={aboutIntroGif}
              alt="Budget Raccoon walkthrough"
              className="block h-auto w-full"
            />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative w-full max-w-md justify-self-center overflow-hidden rounded-[1.9rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,252,249,0.97),rgba(255,244,250,0.98))] p-4 shadow-[0_30px_80px_-42px_rgba(67,54,87,0.45)] sm:p-5 md:justify-self-end"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-coral/15 blur-2xl" />
          <div className="pointer-events-none absolute inset-x-10 bottom-0 h-20 rounded-full bg-[#c9dfff]/30 blur-3xl" />
          <div className="relative mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-ink/45">Welcome back</p>
              <h2 className="mt-1 text-[1.35rem] leading-none text-ink sm:text-[1.55rem]">Sign in</h2>
              <p className="mt-1.5 text-[12px] leading-5 text-ink/55 sm:text-[13px]">Your monthly summary, categories, and goals in one place.</p>
            </div>
            <div className="h-12 w-12 rounded-[1rem] bg-[linear-gradient(135deg,rgba(255,183,198,0.95),rgba(189,219,255,0.95))] shadow-[0_18px_28px_-22px_rgba(0,0,0,0.8)] sm:h-14 sm:w-14" />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2.5 rounded-[1.35rem] bg-white/72 p-2.5 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] sm:gap-3 sm:p-3">
            <div className="rounded-[1.1rem] bg-[#fff5dc] px-3 py-2.5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-ink/45">This week</p>
              <p className="mt-1 text-xl font-extrabold text-ink sm:text-2xl">$186</p>
            </div>
            <div className="rounded-[1.1rem] bg-[#e8f8f1] px-3 py-2.5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-ink/45">Savings</p>
              <p className="mt-1 text-xl font-extrabold text-ink sm:text-2xl">+12%</p>
            </div>
          </div>

          <div className="flex rounded-[1.2rem] border border-white/70 bg-white/80 p-1 text-sm shadow-[0_16px_30px_-28px_rgba(0,0,0,0.9)]">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`flex-1 rounded-md py-1.5 font-medium transition ${
                mode === "login" ? "bg-coral text-white shadow-[0_10px_24px_-18px_rgba(0,0,0,0.9)]" : "text-ink/60"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className={`flex-1 rounded-md py-1.5 font-medium transition ${
                mode === "signup" ? "bg-coral text-white shadow-[0_10px_24px_-18px_rgba(0,0,0,0.9)]" : "text-ink/60"
              }`}
            >
              Sign up
            </button>
          </div>

          <div className="mt-3.5">
            <label className="mb-1.5 block text-[13px] font-bold text-ink/70 sm:text-sm">
              Email
            </label>
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-white/80 px-4 py-2.5 text-[13px] focus:outline-coral sm:text-sm sm:py-2.5"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="mt-3">
            <label className="mb-1.5 block text-[13px] font-bold text-ink/70 sm:text-sm">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/80 px-4 py-2.5 text-[13px] focus:outline-coral sm:text-sm sm:py-2.5"
              placeholder="At least 6 characters"
              required
              minLength={mode === "signup" ? 6 : undefined}
            />
          </div>
          {mode === "signup" && (
            <p className="mt-2.5 text-xs leading-4 text-ink/55 sm:leading-5">
              This creates a brand-new, empty household — your own private space, separate from
              anyone else's data.
            </p>
          )}
          {error && <p className="mt-3 text-[13px] text-red-500 sm:text-sm">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full rounded-[1.2rem] bg-[linear-gradient(90deg,#ff8e70,#ffb65e)] px-4 py-2.5 text-[13px] font-extrabold uppercase tracking-[0.18em] text-white shadow-[0_18px_28px_-20px_rgba(255,142,112,0.7)] hover:opacity-95 disabled:opacity-50 sm:text-sm"
          >
            {submitting ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>

          <p className="mt-2.5 text-center text-[11px] leading-4 text-ink/55 sm:text-xs sm:leading-5">
            Includes monthly insights, recurring reminders, and shared household tracking.
          </p>
        </form>
      </div>
    </div>
  );
}
