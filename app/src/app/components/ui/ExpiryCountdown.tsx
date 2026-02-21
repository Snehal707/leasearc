"use client";

export function ExpiryCountdown({ expiry, graceLabel }: { expiry: bigint; graceLabel?: string }) {
  const now = Math.floor(Date.now() / 1000);
  const t = Number(expiry) - now;
  if (t <= 0) {
    const since = Math.abs(t);
    const days = Math.floor(since / 86400);
    return (
      <div className="text-sm">
        <span className="font-medium text-amber-400">Expired {days} day{days !== 1 ? "s" : ""} ago</span>
        {graceLabel && <p className="mt-0.5 text-xs text-zinc-500">{graceLabel}</p>}
      </div>
    );
  }
  const days = Math.floor(t / 86400);
  const hours = Math.floor((t % 86400) / 3600);
  const minutes = Math.floor((t % 3600) / 60);
  const timeStr = days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  return (
    <div className="text-sm">
      <span className="font-medium text-zinc-300">Expires in {timeStr}</span>
      {graceLabel && <p className="mt-0.5 text-xs text-zinc-500">{graceLabel}</p>}
    </div>
  );
}
