"use client";

import { ARC_DOCS } from "@/lib/arc-docs";

export function NetworkBadge() {
  return (
    <a
      href={ARC_DOCS.connectToArc}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-transparent"
      title="Connect to Arc"
    >
      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" aria-hidden />
      Arc Testnet
    </a>
  );
}
