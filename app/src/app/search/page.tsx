"use client";

import { useState } from "react";
import { useReadContract, useAccount } from "wagmi";
import { TopNav } from "../components/TopNav";
import { NameSearchBar } from "../components/ui/NameSearchBar";
import { NameStatusCard } from "../components/ui/NameStatusCard";
import { PriceSummaryCard } from "../components/ui/PriceSummaryCard";
import { SearchResultSkeleton } from "../components/ui/Skeleton";
import { Alert } from "../components/ui/Alert";
import { DOMAIN_LEASE_ABI } from "@/lib/contracts/DomainLease";
import { getDomainLeaseAddress } from "@/lib/contract-address";
import { ARC_TESTNET_CHAIN_ID } from "@/lib/contracts/DomainLease";

function useDomainStatus(name: string) {
  const addr = getDomainLeaseAddress();
  const { data: available } = useReadContract({
    address: addr,
    abi: DOMAIN_LEASE_ABI,
    functionName: "available",
    args: name ? [name] : undefined,
  });
  const { data: tokenId } = useReadContract({
    address: addr,
    abi: DOMAIN_LEASE_ABI,
    functionName: "getTokenId",
    args: name ? [name] : undefined,
  });
  const { data: expiry } = useReadContract({
    address: addr,
    abi: DOMAIN_LEASE_ABI,
    functionName: "getExpiry",
    args: tokenId !== undefined && tokenId > BigInt(0) ? [tokenId] : undefined,
  });
  const { data: renter } = useReadContract({
    address: addr,
    abi: DOMAIN_LEASE_ABI,
    functionName: "getRenter",
    args: tokenId !== undefined && tokenId > BigInt(0) ? [tokenId] : undefined,
  });
  const { data: pricePerDay } = useReadContract({
    address: addr,
    abi: DOMAIN_LEASE_ABI,
    functionName: "pricePerDay",
  });
  return { available, tokenId, expiry, renter, pricePerDay };
}

export default function SearchPage() {
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [days, setDays] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const { address, chainId } = useAccount();
  const isArc = chainId === ARC_TESTNET_CHAIN_ID;
  const { available, tokenId, expiry, renter, pricePerDay } = useDomainStatus(query);

  const isLoading = query !== "" && available === undefined && tokenId === undefined;
  const usdcPerDay = pricePerDay !== undefined ? (Number(pricePerDay) / 1e6).toFixed(2) : "—";
  const totalUsdc = pricePerDay !== undefined ? ((Number(pricePerDay) * days) / 1e6).toFixed(2) : "0";

  const ctaLabel =
    available === true
      ? "Rent"
      : available === false && address && renter && String(renter).toLowerCase() === address.toLowerCase()
        ? "Manage"
        : available === false
          ? "Reclaim (after expiry)"
          : "Rent";
  const ctaHref =
    available === true
      ? `/rent?name=${encodeURIComponent(query)}&days=${days}`
      : available === false && address && renter && String(renter).toLowerCase() === address.toLowerCase()
        ? "/manage"
        : undefined;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden text-white">
      <TopNav />
      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-4 pt-24">
        <h1 className="font-heading text-4xl font-medium tracking-tight text-white text-premium md:text-5xl">Search</h1>
        <p className="mt-5 mb-10 font-light leading-loose text-slate-200/90">Check if a name is available or rented.</p>

        <div className="mb-10 flex w-full justify-center">
          <NameSearchBar
            value={name}
            onChange={setName}
            onSearch={() => { setError(null); setQuery(name.trim()); }}
            status={isLoading ? "loading" : available === true ? "available" : available === false ? "rented" : "idle"}
          />
        </div>

        {error && (
          <div className="mt-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        {query && (
          <div className="mt-8 text-left">
            {isLoading ? (
              <SearchResultSkeleton />
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <NameStatusCard
                  name={query}
                  available={available ?? undefined}
                  renter={renter as string | undefined}
                  expiry={expiry}
                  tokenId={tokenId}
                />
                <PriceSummaryCard
                  usdcPerDay={usdcPerDay}
                  days={days}
                  totalUsdc={totalUsdc}
                  onDaysChange={setDays}
                  cta={available === true ? "rent" : "manage"}
                  ctaHref={ctaHref}
                  ctaLabel={ctaLabel}
                />
              </div>
            )}
          </div>
        )}

        {!query && (
          <div className="flex h-72 w-full items-center justify-center rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
            <p className="text-center text-xl font-light leading-relaxed text-slate-300 drop-shadow-md">
              Search for a name to see availability
              <br />
              and lease details instantly.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
