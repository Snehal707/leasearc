"use client";

const MIN = 1;
const MAX = 365;

export function LeaseDaysSlider({
  days,
  onChange,
  min = MIN,
  max = MAX,
}: {
  days: number;
  onChange: (days: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-300">Duration (days)</label>
        <input
          type="number"
          min={min}
          max={max}
          value={days}
          onChange={(e) => {
            const v = Math.min(max, Math.max(min, Number(e.target.value) || min));
            onChange(v);
          }}
          className="w-20 rounded-lg border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-800"
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={days}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-500"
      />
    </div>
  );
}
