"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { TopNav } from "../components/TopNav";
import { LeaseDaysSlider } from "../components/ui/LeaseDaysSlider";
import { DOMAIN_LEASE_ABI, USDC_ABI, USDC_ADDRESS } from "@/lib/contracts/DomainLease";
import { getDomainLeaseAddress } from "@/lib/contract-address";
import { ARC_TESTNET_CHAIN_ID } from "@/lib/contracts/DomainLease";
import { ARC_DOCS } from "@/lib/arc-docs";

const MIN_DAYS = 1;
const MAX_DAYS = 365;
const EXPLORER = "https://testnet.arcscan.app";
const PROTOCOL_FEE_PERCENT = 0.01;
const GAS_EST_USDC = 0.01;

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  const items = [
    { q: "How does renting work?", a: "Pay in USDC to lease a name for 1–365 days. You own the lease until it expires. Ownership is secured on-chain via smart contract." },
    { q: "Can I renew my lease?", a: "Yes. Extend your lease before expiry from the Manage page. Pay for additional days in USDC." },
    { q: "How do I reclaim funds?", a: "After a lease expires, anyone can reclaim the name by paying for a new lease. Your previous lease simply ends; there is no separate refund." },
  ];
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-800/80 p-4">
      <h3 className="font-heading text-sm font-semibold text-white">Frequently Asked Questions</h3>
      {items.map((item, i) => (
        <div key={i} className="mt-2 border-b border-zinc-700 last:border-0">
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between py-2 text-left text-sm font-medium text-slate-300"
          >
            {item.q}
            <span className="text-zinc-400">{open === i ? "−" : "+"}</span>
          </button>
          {open === i && <p className="pb-2 text-xs leading-relaxed text-zinc-400">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}

function RentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nameFromQuery = searchParams.get("name") ?? "";
  const daysFromQuery = searchParams.get("days");
  const [name, setName] = useState(nameFromQuery);
  const [days, setDays] = useState(() => {
    const d = daysFromQuery ? parseInt(daysFromQuery, 10) : 30;
    return Number.isNaN(d) || d < 1 || d > 365 ? 30 : d;
  });

  useEffect(() => {
    if (nameFromQuery) setName(nameFromQuery);
  }, [nameFromQuery]);
  useEffect(() => {
    if (daysFromQuery) {
      const d = parseInt(daysFromQuery, 10);
      if (!Number.isNaN(d) && d >= 1 && d <= 365) setDays(d);
    }
  }, [daysFromQuery]);

  const contractAddress = getDomainLeaseAddress();
  const { address, chainId } = useAccount();
  const isArc = chainId === ARC_TESTNET_CHAIN_ID;

  const { data: pricePerDay } = useReadContract({
    address: contractAddress,
    abi: DOMAIN_LEASE_ABI,
    functionName: "pricePerDay",
  });
  const { data: available } = useReadContract({
    address: contractAddress,
    abi: DOMAIN_LEASE_ABI,
    functionName: "available",
    args: name.trim() ? [name.trim()] : undefined,
  });

  const totalPrice = pricePerDay !== undefined ? pricePerDay * BigInt(days) : BigInt(0);
  const leaseCostUsdc = totalPrice ? Number(totalPrice) / 1e6 : 0;
  const protocolFeeUsdc = leaseCostUsdc * PROTOCOL_FEE_PERCENT;
  const totalDueUsdc = leaseCostUsdc + protocolFeeUsdc + GAS_EST_USDC;
  const expiryIfRentedToday = name.trim() && days >= 1
    ? new Date(Date.now() + days * 86400 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  const { data: allowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "allowance",
    args: address && contractAddress ? [address, contractAddress] : undefined,
  });
  const needsApproval = allowance !== undefined && allowance < totalPrice && totalPrice > BigInt(0);

  const { writeContract: writeApprove, isPending: isApprovePending } = useWriteContract();
  const { writeContract: writeRent, isPending: isRentPending, data: rentHash } = useWriteContract();

  const handleApprove = useCallback(() => {
    writeApprove({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: "approve",
      args: [contractAddress, totalPrice],
    });
  }, [writeApprove, contractAddress, totalPrice]);

  const handleRent = useCallback(() => {
    if (!name.trim()) return;
    writeRent({
      address: contractAddress,
      abi: DOMAIN_LEASE_ABI,
      functionName: "rent",
      args: [name.trim(), BigInt(days)],
    });
  }, [writeRent, contractAddress, name, days]);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  useEffect(() => {
    if (rentHash && name.trim() && address) {
      try {
        const key = `leasearc_rented_${address.toLowerCase()}`;
        const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
        const list: string[] = raw ? JSON.parse(raw) : [];
        if (!list.includes(name.trim())) {
          list.push(name.trim());
          window.localStorage.setItem(key, JSON.stringify(list));
        }
      } catch (_) {}
      setShowSuccessModal(true);
    }
  }, [rentHash, name, address]);

  const usdcPerDay = pricePerDay ? (Number(pricePerDay) / 1e6).toFixed(2) : "0";
  const isPending = isApprovePending || isRentPending;

  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <nav className="text-sm text-zinc-400" aria-label="Breadcrumb">
          <Link href="/search" className="hover:text-slate-200">Search</Link>
          <span className="mx-1">›</span>
          <span className="text-slate-300">Rent</span>
        </nav>
        <h1 className="font-heading mt-2 text-2xl font-semibold tracking-tight text-white">Rent a name</h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-300">Complete your lease. Pay in USDC; 1–365 days.</p>

        {!address ? (
          <p className="mt-6 text-slate-300">Connect your wallet to rent a name.</p>
        ) : !isArc ? (
          <p className="mt-6 text-amber-400">Switch to Arc Testnet to rent.</p>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {/* Left: Selected Domain */}
            <div className="space-y-4">
              <div className="rounded-lg border border-zinc-700 bg-zinc-800/80 p-5 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Selected Domain</p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="myname"
                  className="mt-2 w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {name.trim() && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-xl font-bold text-white">{name.trim()}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${available === true ? "bg-green-500/20 text-green-400" : available === false ? "bg-amber-500/20 text-amber-400" : "bg-zinc-600 text-zinc-400"}`}>
                      {available === true ? "• AVAILABLE" : available === false ? "• RENTED" : "—"}
                    </span>
                  </div>
                )}
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Minimum duration</dt>
                    <dd className="text-zinc-300">1 Day</dd>
                  </div>
                  {expiryIfRentedToday && (
                    <div className="flex justify-between">
                      <dt className="text-zinc-500">Expiry after rent</dt>
                      <dd className="text-zinc-300">{expiryIfRentedToday}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Grace period</dt>
                    <dd className="text-zinc-300">—</dd>
                  </div>
                </dl>
                <div className="mt-4 rounded-lg border border-blue-800/50 bg-blue-950/30 px-3 py-2 text-sm text-blue-200">
                  You are renting this domain on the Arc Testnet. Ownership is secured via smart contract for the duration of the lease.
                </div>
              </div>
              <FaqAccordion />
            </div>

            {/* Right: Configure Lease */}
            <div className="space-y-4">
              <div className="rounded-lg border border-zinc-700 bg-zinc-800/80 p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Configure Lease</h2>
                    <p className="mt-0.5 text-sm text-zinc-400">Set your desired rental duration.</p>
                  </div>
                  {usdcPerDay && (
                    <span className="rounded-full bg-green-500/20 px-2.5 py-1 text-xs font-medium text-green-400">• Rate: {usdcPerDay} USDC / day</span>
                  )}
                </div>
                <div className="mt-4">
                  <LeaseDaysSlider days={days} onChange={setDays} />
                </div>
                <div className="mt-4 space-y-2 border-t border-zinc-700 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Lease cost ({days} days)</span>
                    <span className="text-zinc-300">{leaseCostUsdc.toFixed(2)} USDC</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Protocol fee 1%</span>
                    <span className="text-zinc-300">{protocolFeeUsdc.toFixed(2)} USDC</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Network gas (est.)</span>
                    <span className="text-zinc-300">~{GAS_EST_USDC.toFixed(2)} USDC</span>
                  </div>
                </div>
                <p className="mt-3 text-lg font-semibold text-white">Total amount due: {totalDueUsdc.toFixed(2)} USDC</p>
                <div className="mt-4 flex gap-2">
                  {needsApproval ? (
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={isApprovePending}
                      className="rounded-lg bg-amber-500 px-4 py-2.5 font-medium text-black hover:bg-amber-400 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-zinc-800"
                    >
                      {isApprovePending ? "Approving…" : "Approve USDC"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRent}
                      disabled={!name.trim() || isRentPending}
                      className="rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-zinc-800"
                    >
                      {isRentPending ? "Leasing…" : "Confirm rent"}
                    </button>
                  )}
                </div>
                <p className="mt-3 text-xs text-zinc-500">
                  By confirming, you agree to the LeaseArc terms. <a href={ARC_DOCS.gasAndFees} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Gas and fees</a>.
                </p>
              </div>
            </div>
          </div>
        )}

        <Link href="/search" className="mt-6 inline-block text-sm text-zinc-500 hover:text-zinc-300">← Search names</Link>

        {/* Transaction pending modal */}
        {isPending && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-sm rounded-xl border border-blue-800/50 bg-zinc-900 p-6 shadow-xl">
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" aria-hidden />
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {isApprovePending ? "Approving USDC…" : `Leasing ${name.trim() || "…"}…`}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Please wait while the transaction is confirmed on Arc Testnet. Do not close this window.
                </p>
                {rentHash && (
                  <a
                    href={`${EXPLORER}/tx/${rentHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 text-sm text-blue-400 underline"
                  >
                    Tx: {String(rentHash).slice(0, 6)}…{String(rentHash).slice(-4)}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success modal */}
        {showSuccessModal && rentHash && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-sm rounded-xl border border-green-800/50 bg-zinc-900 p-6 shadow-xl">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20">
                  <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">Successfully Leased!</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  You are now the owner of <strong className="text-white">{name.trim()}</strong>. The domain has been added to your wallet.
                </p>
                <div className="mt-6 flex w-full flex-col gap-2">
                  <Link
                    href="/manage"
                    onClick={() => setShowSuccessModal(false)}
                    className="rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-500"
                  >
                    Go to Manage
                  </Link>
                  <a
                    href={`${EXPLORER}/tx/${rentHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-zinc-600 px-4 py-2.5 font-medium text-zinc-300 hover:bg-zinc-800"
                  >
                    View on Explorer
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default function RentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <TopNav />
          <main className="mx-auto max-w-5xl px-4 py-10">
            <p className="text-zinc-500">Loading…</p>
          </main>
        </div>
      }
    >
      <RentContent />
    </Suspense>
  );
}
