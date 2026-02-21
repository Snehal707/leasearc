"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const DURATION_PRESETS = [1, 7, 30, 90, 365];
const MIN_DAYS = 1;
const MAX_DAYS = 365;

export function PriceSummaryCard({
  usdcPerDay,
  days,
  totalUsdc,
  onDaysChange,
  cta,
  ctaHref,
  ctaLabel,
  isLoading,
}: {
  usdcPerDay?: string;
  days: number;
  totalUsdc: string;
  onDaysChange?: (days: number) => void;
  cta?: "rent" | "manage" | "reclaim";
  ctaHref?: string;
  ctaLabel: string;
  isLoading?: boolean;
}) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState(String(days));

  useEffect(() => {
    if (isCustomMode) setCustomInput(String(days));
  }, [days, isCustomMode]);

  const handlePresetClick = (d: number) => {
    setIsCustomMode(false);
    onDaysChange?.(d);
  };
  const handleCustomClick = () => {
    setIsCustomMode(true);
    if (onDaysChange && DURATION_PRESETS.includes(days)) {
      onDaysChange(14);
      setCustomInput("14");
    } else {
      setCustomInput(String(days));
    }
  };
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setCustomInput(raw);
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n) && n >= MIN_DAYS && n <= MAX_DAYS) onDaysChange?.(n);
  };
  const handleCustomBlur = () => setCustomInput(String(days));

  const isCustom = onDaysChange && isCustomMode;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm p-6 card-glow">
      <p className="label-premium mb-2">Pricing</p>
      {usdcPerDay !== undefined && (
        <p className="mt-1 text-lg font-semibold text-white">{usdcPerDay} USDC / day</p>
      )}
      {onDaysChange && (
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-2">
            {DURATION_PRESETS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handlePresetClick(d)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-800 ${
                  !isCustomMode && days === d
                    ? "bg-blue-600 text-white"
                    : "border border-zinc-600 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {d}d
              </button>
            ))}
            <button
              type="button"
              onClick={handleCustomClick}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-800 ${
                isCustomMode
                  ? "bg-blue-600 text-white"
                  : "border border-zinc-600 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              Custom
            </button>
          </div>
          {isCustom && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-300">Days</label>
              <input
                type="number"
                min={MIN_DAYS}
                max={MAX_DAYS}
                step={1}
                value={customInput}
                onChange={handleCustomChange}
                onBlur={handleCustomBlur}
                className="w-20 rounded-lg border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-800"
              />
            </div>
          )}
        </div>
      )}
      <p className="mt-3 text-sm text-slate-300">Total: <span className="font-semibold text-white">{totalUsdc} USDC</span></p>
      <div className="mt-4">
        {ctaHref ? (
          <Link
            href={ctaHref}
            className="inline-block rounded-xl bg-blue-600 px-6 py-3 font-medium tracking-wide text-white hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-black/80 disabled:opacity-50"
          >
            {ctaLabel}
          </Link>
        ) : (
          <button
            type="button"
            disabled={isLoading}
            className="rounded-xl bg-blue-600 px-6 py-3 font-medium tracking-wide text-white hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-black/80 disabled:opacity-50"
          >
            {isLoading ? "…" : ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
}
