import { Router } from "express";
import webpush from "web-push";
import Expense from "../models/Expense.js";
import PushSubscription from "../models/PushSubscription.js";
import Household from "../models/Household.js";
import { getRecurringTemplates } from "../lib/recurringDue.js";

const router = Router();

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:notifications@budgetbeaver.app",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Called once a day by a GitHub Actions cron workflow (not a logged-in user,
// so it authenticates with a shared secret instead of requireAuth).
router.get("/check-bills", async (req, res) => {
  if (req.headers["x-cron-secret"] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const tomorrowDay = tomorrow.getUTCDate();

  const households = await Household.find();
  let notified = 0;
  let skippedNoSub = 0;

  for (const household of households) {
    const subs = await PushSubscription.find({ householdId: household._id });
    if (subs.length === 0) {
      skippedNoSub++;
      continue;
    }

    const expenses = await Expense.find({ householdId: household._id, isRecurring: true });
    const templates = getRecurringTemplates(expenses);
    const due = templates.filter((t) => new Date(t.date).getUTCDate() === tomorrowDay);
    if (due.length === 0) continue;

    const payload = JSON.stringify({
      title: due.length === 1 ? "Bill due tomorrow" : `${due.length} bills due tomorrow`,
      body: due.map((t) => t.note).join(", "),
    });

    for (const sub of subs) {
      try {
        await webpush.sendNotification(sub.subscription, payload);
        notified++;
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushSubscription.deleteOne({ _id: sub._id });
        }
      }
    }
  }

  res.json({ ok: true, notified, householdsWithoutSubscriptions: skippedNoSub, tomorrowDay });
});

export default router;
