"use client";

import { useState, useCallback } from "react";
import { useReadContract } from "wagmi";
import { TopNav } from "../components/TopNav";
import { NameSearchBar } from "../components/ui/NameSearchBar";
import { DOMAIN_LEASE_ABI } from "@/lib/contracts/DomainLease";
import { getDomainLeaseAddress } from "@/lib/contract-address";

const EXPLORER = "https://testnet.arcscan.app";

export default function ResolvePage() {
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const contractAddress = getDomainLeaseAddress();
  const { data: resolved } = useReadContract({
    address: contractAddress,
    abi: DOMAIN_LEASE_ABI,
    functionName: "resolve",
    args: query ? [query] : undefined,
  });

  const { data: tokenId } = useReadContract({
    address: contractAddress,
    abi: DOMAIN_LEASE_ABI,
    functionName: "getTokenId",
    args: query ? [query] : undefined,
  });
  const { data: recordsForQuery } = useReadContract({
    address: contractAddress,
    abi: DOMAIN_LEASE_ABI,
    functionName: "getRecords",
    args: tokenId !== undefined && tokenId > BigInt(0) ? [tokenId] : undefined,
  });

  const copyAddress = useCallback(() => {
    if (!resolved || typeof resolved !== "string") return;
    navigator.clipboard.writeText(resolved);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [resolved]);

  const nameNotFound = query !== "" && tokenId !== undefined && tokenId === BigInt(0);
  const noRecordSet = query !== "" && !nameNotFound && resolved !== undefined && (resolved === "0x0000000000000000000000000000000000000000" || !resolved);
  const hasResolved = resolved && resolved !== "0x0000000000000000000000000000000000000000";
  const sendUsdcUrl = hasResolved ? `${EXPLORER}/address/${resolved}` : null;

  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-white">Resolve</h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-300">Type a name to see the linked wallet address.</p>

        <div className="mt-6">
          <NameSearchBar
            value={name}
            onChange={setName}
            onSearch={() => setQuery(name.trim())}
            placeholder="Domain name"
          />
        </div>

        {query && (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-700 bg-zinc-800/80 p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-300">Resolved address</p>
              {resolved === undefined ? (
                <p className="mt-2 text-sm text-slate-400">Loading…</p>
              ) : nameNotFound ? (
                <div className="mt-4 py-6 text-center">
                  <p className="font-medium text-slate-200">Name not found</p>
                  <p className="mt-1 text-sm text-slate-400">This name has not been leased yet.</p>
                  <a
                    href={`/rent?name=${encodeURIComponent(query)}`}
                    className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                  >
                    Lease {query}
                  </a>
                </div>
              ) : noRecordSet ? (
                <div className="mt-4 py-4">
                  <p className="text-slate-300">No primary address set</p>
                  <p className="mt-1 text-xs text-slate-400">The owner has not set resolution records yet.</p>
                </div>
              ) : (
                <>
                  <p className="mt-2 break-all font-mono text-sm text-white">{String(resolved)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={copyAddress}
                      className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-700"
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <a
                      href={`${EXPLORER}/address/${resolved}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-700"
                    >
                      View on explorer
                    </a>
                  </div>
                </>
              )}
            </div>
            <div className="rounded-lg border border-zinc-700 bg-zinc-800/80 p-4 shadow-sm">
              <p className="text-sm font-medium text-zinc-400">Website & socials</p>
              {recordsForQuery && (recordsForQuery[1] || recordsForQuery[2]) ? (
                <div className="mt-2 space-y-1 text-sm text-zinc-300">
                  {recordsForQuery[1] && (
                    <p>Website: <a href={recordsForQuery[1]} target="_blank" rel="noopener noreferrer" className="underline">{recordsForQuery[1]}</a></p>
                  )}
                  {recordsForQuery[2] && <p>Socials: {recordsForQuery[2]}</p>}
                </div>
              ) : (
                <p className="mt-2 text-sm text-zinc-500">No socials linked.</p>
              )}
              {sendUsdcUrl && (
                <a
                  href={sendUsdcUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                >
                  Send USDC (explorer)
                </a>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
