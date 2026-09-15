import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Blob, Coin, SparkleBurst } from "./illustrations.jsx";
import mascot from "../assets/illustrations/mascot.jpg";

export default function SafeToSpendCard({ id, amount, currency, changePct, className = "" }) {
  const hasChange = changePct !== null && Number.isFinite(changePct);
  const isUp = hasChange && changePct >= 0;

  return (
    <div
      id={id}
      className={`relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#1a5c4c_0%,#227a63_48%,#2f9179_100%)] p-5 sm:p-7 shadow-soft text-cream ${className}`}
    >
      <Blob className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 text-white/10" />
      <Blob className="pointer-events-none absolute -left-20 -bottom-24 h-56 w-56 text-black/10" />
      <SparkleBurst className="pointer-events-none absolute right-16 top-8 h-5 w-5 text-gold/80" />
      <SparkleBurst className="pointer-events-none absolute right-8 top-20 h-3.5 w-3.5 text-white/50" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-white/70">
            Safe to spend
          </p>
          <p className="mt-2 font-display text-[2.75rem] leading-none font-extrabold tabular-nums sm:text-[3.4rem]">
            {currency}
            {Math.abs(amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          {hasChange && (
            <div
              className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${
                isUp ? "bg-white/18 text-white" : "bg-black/15 text-white/90"
              }`}
            >
              {isUp ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
              {Math.abs(changePct).toFixed(0)}% from last month
            </div>
          )}
          {!hasChange && (
            <p className="mt-3 text-sm text-white/70">This month's income minus spending.</p>
          )}
        </div>

        <div className="relative mx-auto h-32 w-32 shrink-0 sm:mx-0 sm:h-40 sm:w-40">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.28),rgba(255,255,255,0)_60%)]" />
          <div className="absolute inset-3 rounded-full bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]" />
          <Coin className="absolute -left-1 bottom-6 h-7 w-7 drop-shadow-[0_6px_10px_rgba(0,0,0,0.25)] sm:h-8 sm:w-8" />
          <Coin className="absolute -right-1 bottom-2 h-6 w-6 drop-shadow-[0_6px_10px_rgba(0,0,0,0.25)] sm:h-7 sm:w-7" />
          <Coin className="absolute right-6 -top-1 h-5 w-5 drop-shadow-[0_6px_10px_rgba(0,0,0,0.25)]" />
          <img
            src={mascot}
            alt="Budget Raccoon"
            className="absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] rounded-full object-cover shadow-[0_18px_22px_rgba(0,0,0,0.3)]"
          />
        </div>
      </div>
    </div>
  );
}
