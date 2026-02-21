"use client";

import { useCallback, useEffect, useState } from "react";
import { usePublicClient, useWatchContractEvent } from "wagmi";
import { DOMAIN_LEASE_ABI, ARC_TESTNET_CHAIN_ID } from "@/lib/contracts/DomainLease";
import { getDomainLeaseAddress } from "@/lib/contract-address";

type EventType = "NameRented" | "NameRenewed" | "NameReclaimed" | "RecordUpdated";

type EventEntry = {
  type: EventType;
  name: string;
  renter?: string;
  duration?: string;
  detail: string;
  txHash?: string;
  blockNumber?: bigint;
};

const BADGE_LABELS: Record<EventType, string> = {
  NameRented: "Rented",
  NameRenewed: "Renewed",
  NameReclaimed: "Reclaimed",
  RecordUpdated: "Records",
};

const FILTER_TABS = [
  { id: "all", label: "All", types: null as EventType[] | null },
  { id: "rents", label: "Rents", types: ["NameRented"] as EventType[] },
  { id: "renewals", label: "Renewals", types: ["NameRenewed"] as EventType[] },
  { id: "reclaims", label: "Reclaims", types: ["NameReclaimed"] as EventType[] },
  { id: "records", label: "Records", types: ["RecordUpdated"] as EventType[] },
] as const;

export function LiveEvents() {
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof FILTER_TABS)[number]["id"]>("all");
  const address = getDomainLeaseAddress();
  const publicClient = usePublicClient({ chainId: ARC_TESTNET_CHAIN_ID });

  const push = useCallback((entry: EventEntry) => {
    setEvents((prev) => [entry, ...prev].slice(0, 20));
  }, []);

  // Fetch recent historical events on mount (chunked to avoid RPC limits)
  useEffect(() => {
    if (!address || address === "0x0000000000000000000000000000000000000000" || !publicClient) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const CHUNK = 2000n;
    const MAX_BLOCKS = 50_000n;
    const run = async () => {
      try {
        const toBlock = await publicClient.getBlockNumber();
        const startBlock = toBlock > MAX_BLOCKS ? toBlock - MAX_BLOCKS : 0n;
        const allLogs: EventEntry[] = [];
        let chunkTo = toBlock;
        while (chunkTo >= startBlock && !cancelled) {
          const fromBlock = chunkTo - CHUNK + 1n >= startBlock ? chunkTo - CHUNK + 1n : startBlock;
          try {
            const [rented, renewed, reclaimed, records] = await Promise.all([
              publicClient.getContractEvents({
                address,
                abi: DOMAIN_LEASE_ABI,
                eventName: "NameRented",
                fromBlock,
                toBlock: chunkTo,
              }),
              publicClient.getContractEvents({
                address,
                abi: DOMAIN_LEASE_ABI,
                eventName: "NameRenewed",
                fromBlock,
                toBlock: chunkTo,
              }),
              publicClient.getContractEvents({
                address,
                abi: DOMAIN_LEASE_ABI,
                eventName: "NameReclaimed",
                fromBlock,
                toBlock: chunkTo,
              }),
              publicClient.getContractEvents({
                address,
                abi: DOMAIN_LEASE_ABI,
                eventName: "RecordUpdated",
                fromBlock,
                toBlock: chunkTo,
              }),
            ]);
            [
              ...rented.map((log) => {
                const args = log.args as { name: string; renter: string; daysRented: bigint };
                const r = args.renter ?? "";
                return { type: "NameRented" as const, name: args.name, renter: r, duration: `${args.daysRented}d`, detail: `Rented by ${r.slice(0, 8)}…`, txHash: log.transactionHash, blockNumber: log.blockNumber };
              }),
              ...renewed.map((log) => {
                const args = log.args as { name: string; renter: string; daysAdded: bigint };
                const r = args.renter ?? "";
                return { type: "NameRenewed" as const, name: args.name, renter: r, duration: `+${args.daysAdded}d`, detail: `Renewed`, txHash: log.transactionHash, blockNumber: log.blockNumber };
              }),
              ...reclaimed.map((log) => {
                const args = log.args as { name: string; newRenter: string };
                const r = args.newRenter ?? "";
                return { type: "NameReclaimed" as const, name: args.name, renter: r, duration: "—", detail: "Reclaimed", txHash: log.transactionHash, blockNumber: log.blockNumber };
              }),
              ...records.map((log) => {
                const args = log.args as { name: string; renter: string; primaryWallet: string };
                const r = args.renter ?? "";
                return { type: "RecordUpdated" as const, name: args.name, renter: r, duration: "—", detail: "Records updated", txHash: log.transactionHash, blockNumber: log.blockNumber };
              }),
            ].forEach((e) => allLogs.push(e));
          } catch {
            // skip failed chunk
          }
          chunkTo = fromBlock - 1n;
          if (allLogs.length >= 20) break;
        }
        if (cancelled) return;
        allLogs.sort((a, b) => Number((b.blockNumber ?? 0n) - (a.blockNumber ?? 0n)));
        setEvents(allLogs.slice(0, 20));
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
        const args = log.args as { name: string; renter: string; daysRented: bigint };
        const r = args.renter ?? "";
        push({
          type: "NameRented",
          name: args.name,
          renter: r,
          duration: `${args.daysRented}d`,
          detail: `Rented by ${r.slice(0, 8)}…`,
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
        const r = args.renter ?? "";
        push({
          type: "NameRenewed",
          name: args.name,
          renter: r,
          duration: `+${args.daysAdded}d`,
          detail: "Renewed",
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
        const r = args.newRenter ?? "";
        push({
          type: "NameReclaimed",
          name: args.name,
          renter: r,
          duration: "—",
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
        const args = log.args as { name: string; renter: string };
        const r = args.renter ?? "";
        push({
          type: "RecordUpdated",
          name: args.name,
          renter: r,
          duration: "—",
          detail: "Records updated",
          txHash: log.transactionHash,
        });
      });
    },
  });

  if (address === "0x0000000000000000000000000000000000000000") return null;

  const filtered = activeTab === "all"
    ? events
    : events.filter((e) => {
        const tab = FILTER_TABS.find((t) => t.id === activeTab);
        return tab?.types?.includes(e.type);
      });

  const arcScanUrl = `https://testnet.arcscan.app/address/${address}#events`;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="label-premium">Live activity</p>
          <p className="mt-0.5 text-xs text-slate-400">Contract events (updates when new events are emitted)</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <ul className="mt-4 space-y-3 max-h-64 overflow-y-auto">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-4 w-24 rounded bg-slate-700/50" />
              <div className="h-4 w-14 rounded bg-slate-700/50" />
              <div className="h-4 w-16 rounded bg-slate-700/50" />
              <div className="h-4 w-10 rounded bg-slate-700/50" />
            </li>
          ))
        ) : filtered.length === 0 ? (
          <li className="text-sm text-slate-300">No recent events yet. Rent or renew a name to see activity here.</li>
        ) : (
          filtered.map((e, i) => (
            <li
              key={`${e.txHash}-${i}`}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm min-w-0"
            >
              <span className="font-medium text-slate-100 truncate basis-full sm:basis-auto">&quot;{e.name}&quot;</span>
              <span className="rounded px-2 py-0.5 text-xs font-medium bg-white/10 text-slate-200 shrink-0">
                {BADGE_LABELS[e.type]}
              </span>
              <span className="font-mono text-slate-400 text-xs truncate shrink-0">
                {e.renter ? `${e.renter.slice(0, 6)}…${e.renter.slice(-4)}` : "—"}
              </span>
              <span className="text-slate-400 text-xs shrink-0">{e.duration ?? "—"}</span>
              {e.txHash ? (
                <a
                  href={`https://testnet.arcscan.app/tx/${e.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline text-xs shrink-0 hover:text-blue-300"
                >
                  tx
                </a>
              ) : (
                <span className="shrink-0" />
              )}
            </li>
          ))
        )}
      </ul>
      {!loading && events.length > 0 && (
        <a
          href={arcScanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-xs text-blue-400 underline hover:text-blue-300"
        >
          View all events
        </a>
      )}
    </div>
  );
}
