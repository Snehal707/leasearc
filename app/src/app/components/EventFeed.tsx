"use client";

import { useCallback, useState } from "react";
import { useWatchContractEvent } from "wagmi";
import { DOMAIN_LEASE_ABI } from "@/lib/contracts/DomainLease";
import { getDomainLeaseAddress } from "@/lib/contract-address";

type EventEntry = {
  type: "NameRented" | "NameRenewed" | "NameReclaimed" | "RecordUpdated";
  name: string;
  detail: string;
  txHash?: string;
};

const EVENT_ICONS: Record<EventEntry["type"], string> = {
  NameRented: "📋",
  NameRenewed: "🔄",
  NameReclaimed: "⚡",
  RecordUpdated: "✏️",
};

const EXPLORER_TX = "https://testnet.arcscan.app/tx";

export function EventFeed() {
  const [events, setEvents] = useState<EventEntry[]>([]);
  const address = getDomainLeaseAddress();

  const push = useCallback((entry: EventEntry) => {
    setEvents((prev) => [entry, ...prev].slice(0, 20));
  }, []);

  useWatchContractEvent({
    address,
    abi: DOMAIN_LEASE_ABI,
    eventName: "NameRented",
    onLogs(logs) {
      logs.forEach((log) => {
        const args = log.args as { name: string; renter: string; daysRented: bigint };
        push({
          type: "NameRented",
          name: args.name,
          detail: `Rented for ${args.daysRented} days`,
          txHash: log.transactionHash,
        });
      });
    },
  });

  useWatchContractEvent({
    address,
    abi: DOMAIN_LEASE_ABI,
    eventName: "NameRenewed",
    onLogs(logs) {
      logs.forEach((log) => {
        const args = log.args as { name: string; renter: string; daysAdded: bigint };
        push({
          type: "NameRenewed",
          name: args.name,
          detail: `+${args.daysAdded} days`,
          txHash: log.transactionHash,
        });
      });
    },
  });

  useWatchContractEvent({
    address,
    abi: DOMAIN_LEASE_ABI,
    eventName: "NameReclaimed",
    onLogs(logs) {
      logs.forEach((log) => {
        const args = log.args as { name: string; newRenter: string };
        push({
          type: "NameReclaimed",
          name: args.name,
          detail: "Reclaimed",
          txHash: log.transactionHash,
        });
      });
    },
  });

  useWatchContractEvent({
    address,
    abi: DOMAIN_LEASE_ABI,
    eventName: "RecordUpdated",
    onLogs(logs) {
      logs.forEach((log) => {
        const args = log.args as { name: string };
        push({
          type: "RecordUpdated",
          name: args.name,
          detail: "Records updated",
          txHash: log.transactionHash,
        });
      });
    },
  });

  if (address === "0x0000000000000000000000000000000000000000") return null;

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-800/80 p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-white">Activity</h2>
      <p className="mt-0.5 text-xs text-zinc-500">Live contract events</p>
      <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
        {events.length === 0 ? (
          <li className="text-sm text-zinc-400">No recent events.</li>
        ) : (
          events.map((e, i) => (
            <li key={`${e.txHash}-${i}`} className="flex items-start gap-2 text-sm">
              <span className="text-base" aria-hidden>{EVENT_ICONS[e.type]}</span>
              <span>
                <span className="font-medium text-zinc-300">{e.type}</span>{" "}
                <span className="text-zinc-400">&quot;{e.name}&quot;</span> — {e.detail}
                {e.txHash && (
                  <a
                    href={`${EXPLORER_TX}/${e.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-xs text-blue-600 underline"
                  >
                    tx
                  </a>
                )}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
