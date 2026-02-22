"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, usePublicClient, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { TopNav } from "../components/TopNav";
import { ExpiryCountdown } from "../components/ui/ExpiryCountdown";
import { RecordsForm } from "../components/ui/RecordsForm";
import { EventFeed } from "../components/EventFeed";
import { Alert } from "../components/ui/Alert";
import { LeaseDaysSlider } from "../components/ui/LeaseDaysSlider";
import { DOMAIN_LEASE_ABI, USDC_ABI, USDC_ADDRESS } from "@/lib/contracts/DomainLease";
import { getDomainLeaseAddress } from "@/lib/contract-address";
import { ARC_TESTNET_CHAIN_ID } from "@/lib/contracts/DomainLease";

const MAX_DAYS = 365;
const STORAGE_KEY_PREFIX = "leasearc_rented_";
const EXPIRING_SOON_DAYS = 7;

export default function ManagePage() {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [rentedNames, setRentedNames] = useState<string[]>([]);
  const [backfillTrigger, setBackfillTrigger] = useState(0);
  const [backfillLoading, setBackfillLoading] = useState(false);

  useEffect(() => setMounted(true), []);
  const [days, setDays] = useState(30);
  const [primary, setPrimary] = useState("");
  const [website, setWebsite] = useState("");
  const [socials, setSocials] = useState("");

  const contractAddress = getDomainLeaseAddress();
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient();
  const isArc = chainId === ARC_TESTNET_CHAIN_ID;

  useEffect(() => {
    if (typeof window === "undefined" || !address) return;
    try {
      const key = `${STORAGE_KEY_PREFIX}${address.toLowerCase()}`;
      const raw = window.localStorage.getItem(key);
      const list: string[] = raw ? JSON.parse(raw) : [];
      setRentedNames(list);
    } catch (_) {
      setRentedNames([]);
    }
  }, [address]);

  // Backfill from chain: names you rented (RPCs often reject fromBlock 0, so use recent range)
  useEffect(() => {
    if (!address || !publicClient || !contractAddress) return;
    setBackfillLoading(true);
    const key = `${STORAGE_KEY_PREFIX}${address.toLowerCase()}`;
    publicClient
      .getBlockNumber()
      .then((blockNumber) => {
        const fromBlock = blockNumber > 100_000n ? blockNumber - 100_000n : 0n;
        return publicClient.getContractEvents({
          address: contractAddress,
          abi: DOMAIN_LEASE_ABI,
          eventName: "NameRented",
          args: { renter: address },
          fromBlock,
          toBlock: blockNumber,
        });
      })
      .then((events) => {
        const fromChain = [
          ...new Set(
            events.map((e) => e.args.name).filter((n): n is string => typeof n === "string")
          ),
        ];
        if (fromChain.length === 0) return;
        try {
          const raw = window.localStorage.getItem(key);
          const fromStorage: string[] = raw ? JSON.parse(raw) : [];
          const merged = [...new Set([...fromChain, ...fromStorage])];
          window.localStorage.setItem(key, JSON.stringify(merged));
          setRentedNames(merged);
        } catch (_) {}
      })
      .catch(() => {})
      .finally(() => setBackfillLoading(false));
  }, [address, publicClient, contractAddress, backfillTrigger]);

  const { data: tokenId } = useReadContract({
    address: contractAddress,
    abi: DOMAIN_LEASE_ABI,
    functionName: "getTokenId",
    args: name.trim() ? [name.trim()] : undefined,
  });
  const { data: renter } = useReadContract({
    address: contractAddress,
    abi: DOMAIN_LEASE_ABI,
    functionName: "getRenter",
    args: tokenId !== undefined && tokenId > BigInt(0) ? [tokenId] : undefined,
  });
  const { data: expiry } = useReadContract({
    address: contractAddress,
    abi: DOMAIN_LEASE_ABI,
    functionName: "getExpiry",
    args: tokenId !== undefined && tokenId > BigInt(0) ? [tokenId] : undefined,
  });
  const { data: records } = useReadContract({
    address: contractAddress,
    abi: DOMAIN_LEASE_ABI,
    functionName: "getRecords",
    args: tokenId !== undefined && tokenId > BigInt(0) ? [tokenId] : undefined,
  });

  const prevTokenIdRef = useRef<bigint | undefined>(undefined);
  useEffect(() => {
    if (tokenId === undefined || tokenId <= BigInt(0) || !records) return;
    if (prevTokenIdRef.current !== tokenId) {
      prevTokenIdRef.current = tokenId;
      setPrimary(records[0] && String(records[0]) !== "0x0000000000000000000000000000000000000000" ? String(records[0]) : "");
      setWebsite(records[1] ?? "");
      setSocials(records[2] ?? "");
    }
  }, [tokenId, records]);

  const { data: pricePerDay } = useReadContract({
    address: contractAddress,
    abi: DOMAIN_LEASE_ABI,
    functionName: "pricePerDay",
  });
  const renewPrice = pricePerDay !== undefined ? pricePerDay * BigInt(days) : BigInt(0);
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "allowance",
    args: address && contractAddress ? [address, contractAddress] : undefined,
  });
  const needsApproval = allowance !== undefined && allowance < renewPrice && renewPrice > BigInt(0);

  const isRenter = address && renter && address.toLowerCase() === String(renter).toLowerCase();

  const { writeContract: writeApprove, isPending: isApprovePending, data: approveHash } = useWriteContract();
  const { writeContract: writeRenew, isPending: isRenewPending } = useWriteContract();
  const { writeContract: writeSetRecords, isPending: isSetRecordsPending } = useWriteContract();

  const { isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({ hash: approveHash });
  useEffect(() => {
    if (isApproveConfirmed && approveHash) {
      refetchAllowance();
    }
  }, [isApproveConfirmed, approveHash, refetchAllowance]);

  const handleApprove = useCallback(() => {
    writeApprove({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: "approve",
      args: [contractAddress, renewPrice],
    });
  }, [writeApprove, contractAddress, renewPrice]);

  const handleRenew = useCallback(() => {
    if (tokenId === undefined || tokenId === BigInt(0)) return;
    writeRenew({
      address: contractAddress,
      abi: DOMAIN_LEASE_ABI,
      functionName: "renew",
      args: [tokenId, BigInt(days)],
    });
  }, [writeRenew, contractAddress, tokenId, days]);

  const handleSetRecords = useCallback(() => {
    if (tokenId === undefined || tokenId === BigInt(0)) return;
    const primaryAddr = primary.trim() && primary.startsWith("0x") ? (primary.trim() as `0x${string}`) : "0x0000000000000000000000000000000000000000" as `0x${string}`;
    writeSetRecords({
      address: contractAddress,
      abi: DOMAIN_LEASE_ABI,
      functionName: "setRecords",
      args: [tokenId, primaryAddr, website.trim(), socials.trim()],
    });
  }, [writeSetRecords, contractAddress, tokenId, primary, website, socials]);

  const now = Math.floor(Date.now() / 1000);
  const timeLeft = expiry !== undefined ? Number(expiry) - now : 0;
  const expiringSoon = expiry !== undefined && expiry > BigInt(0) && timeLeft > 0 && timeLeft < EXPIRING_SOON_DAYS * 86400;
  const isExpired = expiry !== undefined && expiry > BigInt(0) && timeLeft <= 0;

  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-white">Manage</h1>
        <p className="mt-1 text-sm text-zinc-400">Renew or edit records for a name you rent.</p>
        {!mounted || !address ? (
          <p className="mt-6 text-zinc-400">Connect your wallet to manage your names.</p>
        ) : !isArc ? (
          <p className="mt-6 text-amber-400">Switch to Arc Testnet.</p>
        ) : (
          <>
            {expiringSoon && (
              <div className="mt-4">
                <Alert variant="warning">This name is expiring soon. Renew to keep it.</Alert>
              </div>
            )}
            {isExpired && name.trim() && isRenter && (
              <div className="mt-4">
                <Alert variant="warning">This name has expired. Renew now to prevent it from being reclaimed (1 hour grace period).</Alert>
              </div>
            )}
            {rentedNames.length === 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-zinc-500">No rented names found. Rent a name on the Rent page or type a name below.</p>
                <button
                  type="button"
                  onClick={() => setBackfillTrigger((c) => c + 1)}
                  disabled={backfillLoading}
                  className="text-sm text-zinc-400 underline hover:text-zinc-200 disabled:opacity-50"
                >
                  {backfillLoading ? "Loading from chain…" : "Load my names from chain"}
                </button>
              </div>
            )}
            {rentedNames.length > 0 && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-zinc-300">Your rented names</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {rentedNames.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setName(n)}
                      className={`rounded-lg border px-3 py-1.5 text-sm ${
                        name === n ? "border-blue-500 bg-blue-600 text-white" : "border-zinc-600 hover:bg-zinc-700 text-zinc-300"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6">
              <label className="block text-sm font-medium text-zinc-300">Name you rent</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="myname"
                className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-white placeholder:text-zinc-500"
              />
            </div>
            {name.trim() && (tokenId === BigInt(0) || tokenId === undefined) && (
              <p className="mt-4 text-zinc-500">No lease found for this name.</p>
            )}
            {name.trim() && tokenId !== undefined && tokenId > BigInt(0) && !isRenter && (
              <p className="mt-4 text-amber-600">You are not the renter of this name.</p>
            )}
            {name.trim() && isRenter && tokenId !== undefined && tokenId > BigInt(0) && (
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                <div className="space-y-4">
                  <div className="rounded-lg border border-zinc-700 bg-zinc-800/80 p-4 shadow-sm">
                    <h2 className="text-sm font-semibold text-white">Name overview</h2>
                    <p className="mt-1 font-medium text-zinc-200">{name.trim()}</p>
                    {expiry !== undefined && Number(expiry) <= Math.floor(Date.now() / 1000) ? (
                      <span className="mt-2 inline-block rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-400">Expired</span>
                    ) : (
                      <span className="mt-2 inline-block rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-400">Active</span>
                    )}
                    {expiry !== undefined && (
                      <div className="mt-3">
                        <ExpiryCountdown expiry={expiry} graceLabel="1 hour grace period before others can reclaim." />
                      </div>
                    )}
                    <div className="mt-4 space-y-2">
                      <LeaseDaysSlider days={days} onChange={setDays} />
                      <p className="text-sm text-zinc-400">Add {days} days = {(Number(renewPrice) / 1e6).toFixed(2)} USDC</p>
                      <p className="text-xs text-zinc-500">Step 1: Approve USDC · Step 2: Renew</p>
                      {needsApproval ? (
                        <button
                          type="button"
                          onClick={handleApprove}
                          disabled={isApprovePending}
                          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50"
                        >
                          {isApprovePending ? "Approving…" : "1. Approve USDC"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleRenew}
                          disabled={isRenewPending}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                        >
                          {isRenewPending ? "Renewing…" : "2. Renew"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <RecordsForm
                    primary={primary}
                    website={website}
                    socials={socials}
                    onPrimaryChange={setPrimary}
                    onWebsiteChange={setWebsite}
                    onSocialsChange={setSocials}
                    onSave={handleSetRecords}
                    isSaving={isSetRecordsPending}
                  />
                </div>
                <div>
                  <EventFeed />
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
