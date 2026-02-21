"use client";

import { useCallback, useState } from "react";
import { useWatchContractEvent } from "wagmi";
import { DOMAIN_LEASE_ABI } from "@/lib/contracts/DomainLease";
import { getDomainLeaseAddress } from "@/lib/contract-address";

type EventEntry = {
  type: string;
  name: string;
  detail: string;
  txHash?: string;
};

export function LiveEvents() {
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
        const args = log.args as { name: string; renter: string; expiry: bigint; daysRented: bigint; paid: bigint };
        push({
          type: "NameRented",
          name: args.name,
          detail: `Rented by ${args.renter?.slice(0, 8)}… for ${args.daysRented} days`,
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
          detail: `Renewed by ${args.renter?.slice(0, 8)}… +${args.daysAdded} days`,
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
          detail: `Reclaimed by ${args.newRenter?.slice(0, 8)}…`,
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
        const args = log.args as { name: string; renter: string; primaryWallet: string };
        push({
          type: "RecordUpdated",
          name: args.name,
          detail: `Records updated, primary ${args.primaryWallet?.slice(0, 8)}…`,
          txHash: log.transactionHash,
        });
      });
    },
  });

  if (address === "0x0000000000000000000000000000000000000000") return null;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm p-6">
      <p className="label-premium">Live activity</p>
      <p className="mt-0.5 text-xs text-slate-400">Contract events (updates when new events are emitted)</p>
      <ul className="mt-4 space-y-2 max-h-48 overflow-y-auto">
        {events.length === 0 ? (
          <li className="text-sm text-slate-300">No recent events yet.</li>
        ) : (
          events.map((e, i) => (
            <li key={`${e.txHash}-${i}`} className="text-sm">
              <span className="font-medium text-slate-200">{e.type}</span>{" "}
              <span className="text-slate-300">&quot;{e.name}&quot;</span> — {e.detail}
              {e.txHash && (
                <a
                  href={`https://testnet.arcscan.app/tx/${e.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-blue-400 underline text-xs"
                >
                  tx
                </a>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
