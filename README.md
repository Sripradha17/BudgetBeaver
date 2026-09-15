# Budget Raccoon

A household finance tracker — log expenses and income, set monthly category budgets, track
savings goals, get bill-due push reminders, import past expenses from Excel/CSV, and export
monthly reports. Data lives in MongoDB Atlas, behind real email/password auth (no localStorage
beyond the auth token).

## Stack

- **Client** (`src/client`): Vite + React 18, Tailwind CSS, `react-router-dom`, `recharts` for
  charts, `lucide-react` icons, SheetJS (`xlsx`) for import/export. Ships as an installable PWA
  (offline app-shell via a service worker; API calls are never cached).
- **Server** (`src/server`): Express + Mongoose REST API, JWT auth (`bcryptjs` + `jsonwebtoken`),
  `web-push` for bill-due notifications.

## Setup

1. **MongoDB Atlas connection string** — put it in the `.env` file at the project root:

   ```
   MONGODB_URI="mongodb+srv://<user>:<password>@<cluster-url>/budget-raccoon?retryWrites=true&w=majority"
   PORT=5000
   JWT_SECRET="a long random string"
   ```

   (A `.env` with Atlas credentials already exists at the project root — just make sure
   `MONGODB_URI` and `JWT_SECRET` are set there. It's git-ignored.)

2. **Install dependencies** (run once from the project root):

   ```bash
   npm install
   npm run install:client
   ```

3. **Run both client and server together in dev mode:**

   ```bash
   npm run dev
   ```

   - API runs on `http://localhost:5000`
   - Client runs on `http://localhost:5173` and proxies `/api/*` to the server.

4. **Sign up** — the login page creates a brand-new, empty household per signup. There's no
   invite flow yet; sharing a household with someone else today means pointing a second
   `User` document at the same `householdId` directly in the database.

## Project structure

```
src/
  server/            Express + Mongoose API
    models/          Expense, Income, Category, Settings, Goal, Household, User, PushSubscription
    routes/          /api/auth, /expenses, /income, /categories, /settings, /goals, /push, /reset, /cron
    middleware/      auth.js (JWT requireAuth)
    lib/             recurringDue.js (bill-reminder due-date logic)
    db.js            Mongo connection
    index.js         App entry point
  client/            Vite React app
    src/
      pages/         Home, Overview, Expenses, Income, Budgets, Goals, Reports, Settings, Login
      components/    Sidebar/TopBar/MobileBottomNav shell, charts, cards, illustrated heroes
      context/       DataContext (API-backed state), MonthContext (selected month)
      lib/           api client, currency conversion, insights/trends, Excel import/export, etc.
      theme/         pageTheme.js — per-route accent color + background theming
```

## Features

- **Expenses** — log with amount, date, category, note, payer, and an optional recurring flag;
  optional foreign-currency entry with live exchange-rate conversion to the household's base
  currency. Search/filter/sort, day-grouped list, duplicate-entry detection, missing-recurring-
  charge nudges, and Excel/CSV import with per-row review before committing.
- **Income** — log per-person income, see combined and per-person totals for the month.
- **Budgets** — recurring monthly budget per category, or a one-off override for a single month,
  with progress bars (green/amber/red). Savings and Investment are treated as floor goals —
  exceeding them is shown as good news, not overspending.
- **Goals** — savings goals tracked either manually or automatically from spend in a linked
  category since a start date, with progress bars and a celebration banner on completion.
- **Reports** — all-time net worth, total income, savings rate, and income/expense/savings trend
  charts.
- **Overview** — "safe to spend" balance, budget summary, auto-generated month-over-month
  insights (no AI, just arithmetic), and category breakdown.
- **Multi-currency** — set a base currency in Settings; foreign-currency expenses convert to it
  automatically at entry time (Income and Budgets stay in the base currency).
- **Bill reminders** — opt in to push notifications for upcoming recurring charges; a scheduled
  GitHub Actions cron job (`.github/workflows/bill-reminders.yml`) hits `/api/cron` to send them.
- **Import / Export** — upload an .xlsx/.xls/.csv file, auto-detect Date/Category/Amount/Note
  columns, review and edit each row before importing; export the current month or full history
  to Excel/CSV.
- **Settings** — currency symbol + base currency, per-person labels, custom categories, bill
  reminder opt-in, data export, and a "reset all data" option.

## Tests

Pure calculation logic (insights, trends, recurring-charge detection, duplicate detection,
budget resolution, month math) is covered with [Vitest](https://vitest.dev):

```bash
npm test              # server lib tests + client lib tests
npm run test:server   # just src/server/lib
npm run test:client   # just src/client/src/lib
```

There's no route/integration test layer yet — these tests only cover the pure functions that
compute the numbers users see.

## Deployment

GitHub Pages only serves static files, so the client and server deploy to two different
places:

- **Client → GitHub Pages.** `.github/workflows/deploy.yml` builds `src/client` and publishes
  it automatically on every push to `main`. One-time setup: in the repo's **Settings → Pages**,
  set Source to "GitHub Actions".
- **Server → Render** (or any Node host). `render.yaml` at the repo root is a Render blueprint
  for the API. In the [Render dashboard](https://dashboard.render.com), "New +" → "Blueprint",
  connect this repo, and set the `MONGODB_URI` and `JWT_SECRET` secrets. In Atlas's **Network
  Access**, allow `0.0.0.0/0` — Render's free tier doesn't have a fixed outbound IP, so you
  can't whitelist a single address.
- **Wire them together.** Once the Render service is live, copy its URL (e.g.
  `https://budget-raccoon-api.onrender.com`) and add it as a GitHub Actions secret named
  `VITE_API_URL`, with `/api` appended (**Settings → Secrets and variables → Actions →
  New repository secret**): `https://budget-raccoon-api.onrender.com/api`. Push to `main` (or
  re-run the workflow) to rebuild the client against the live API.
- **Bill reminders.** `.github/workflows/bill-reminders.yml` runs daily and calls
  `GET /api/cron/check-bills` on the live server. It needs two more GitHub Actions secrets —
  `API_BASE_URL` (the Render URL, no `/api` suffix) and `CRON_SECRET` — and the server needs
  matching `CRON_SECRET`, `VAPID_PUBLIC_KEY`, and `VAPID_PRIVATE_KEY` env vars for push to work.

Render's free tier spins down after inactivity, so the first request after a while takes a
few seconds to wake it back up.
