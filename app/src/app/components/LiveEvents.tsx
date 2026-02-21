"use client";

import { useCallback, useEffect, useState } from "react";
import { usePublicClient, useWatchContractEvent } from "wagmi";
import { DOMAIN_LEASE_ABI } from "@/lib/contracts/DomainLease";
import { getDomainLeaseAddress } from "@/lib/contract-address";

type EventEntry = {
  type: string;
  name: string;
  detail: string;
  txHash?: string;
  blockNumber?: bigint;
};

export function LiveEvents() {
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const address = getDomainLeaseAddress();
  const publicClient = usePublicClient();

  const push = useCallback((entry: EventEntry) => {
    setEvents((prev) => [entry, ...prev].slice(0, 20));
  }, []);

  // Fetch recent historical events on mount
  useEffect(() => {
    if (!address || address === "0x0000000000000000000000000000000000000000" || !publicClient) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const run = async () => {
      try {
        const blockNumber = await publicClient.getBlockNumber();
        const fromBlock = blockNumber > 50_000n ? blockNumber - 50_000n : 0n;
        const [rented, renewed, reclaimed, records] = await Promise.all([
          publicClient.getContractEvents({
            address,
            abi: DOMAIN_LEASE_ABI,
            eventName: "NameRented",
            fromBlock,
            toBlock: blockNumber,
          }),
          publicClient.getContractEvents({
            address,
            abi: DOMAIN_LEASE_ABI,
            eventName: "NameRenewed",
            fromBlock,
            toBlock: blockNumber,
          }),
          publicClient.getContractEvents({
            address,
            abi: DOMAIN_LEASE_ABI,
            eventName: "NameReclaimed",
            fromBlock,
            toBlock: blockNumber,
          }),
          publicClient.getContractEvents({
            address,
            abi: DOMAIN_LEASE_ABI,
            eventName: "RecordUpdated",
            fromBlock,
            toBlock: blockNumber,
          }),
        ]);
        if (cancelled) return;
        const all: EventEntry[] = [
          ...rented.map((log) => {
            const args = log.args as { name: string; renter: string; daysRented: bigint };
            return {
              type: "NameRented",
              name: args.name,
              detail: `Rented by ${args.renter?.slice(0, 8)}… for ${args.daysRented} days`,
              txHash: log.transactionHash,
              blockNumber: log.blockNumber,
            };
          }),
          ...renewed.map((log) => {
            const args = log.args as { name: string; renter: string; daysAdded: bigint };
            return {
              type: "NameRenewed",
              name: args.name,
              detail: `Renewed by ${args.renter?.slice(0, 8)}… +${args.daysAdded} days`,
              txHash: log.transactionHash,
              blockNumber: log.blockNumber,
            };
          }),
          ...reclaimed.map((log) => {
            const args = log.args as { name: string; newRenter: string };
            return {
              type: "NameReclaimed",
              name: args.name,
              detail: `Reclaimed by ${args.newRenter?.slice(0, 8)}…`,
              txHash: log.transactionHash,
              blockNumber: log.blockNumber,
            };
          }),
          ...records.map((log) => {
            const args = log.args as { name: string; renter: string; primaryWallet: string };
            return {
              type: "RecordUpdated",
              name: args.name,
              detail: `Records updated, primary ${args.primaryWallet?.slice(0, 8)}…`,
              txHash: log.transactionHash,
              blockNumber: log.blockNumber,
            };
          }),
        ];
        all.sort((a, b) => Number((b.blockNumber ?? 0n) - (a.blockNumber ?? 0n)));
        setEvents(all.slice(0, 20));
      } catch {
        // ignore RPC errors
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [address, publicClient]);

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
      <p className="mt-0.5 text-xs text-slate-400">Recent rents, renewals, reclaims, and record updates from everyone.</p>
      <ul className="mt-4 space-y-2 max-h-48 overflow-y-auto">
        {loading ? (
          <li className="text-sm text-slate-400">Loading recent events…</li>
        ) : events.length === 0 ? (
          <li className="text-sm text-slate-300">No recent activity yet. Rents, renewals, and reclaims will appear here when they happen.</li>
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
