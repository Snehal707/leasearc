"use client";

import { ExpiryCountdown } from "./ExpiryCountdown";
import { getDomainLeaseAddress } from "@/lib/contract-address";

const EXPLORER = "https://testnet.arcscan.app";

export function NameStatusCard({
  name,
  available,
  renter,
  expiry,
  tokenId,
}: {
  name: string;
  available?: boolean;
  renter?: string;
  expiry?: bigint;
  tokenId?: bigint;
}) {
  const contractAddress = getDomainLeaseAddress();
  const explorerContract = contractAddress && contractAddress !== "0x0000000000000000000000000000000000000000"
    ? `${EXPLORER}/address/${contractAddress}`
    : null;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm p-6 card-glow">
      <p className="label-premium mb-2">Selected Domain</p>
      <p className="font-heading font-semibold text-white">{name}</p>
      <div className="mt-2">
        {available === true ? (
          <span className="inline-block rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-400">
            Available
          </span>
        ) : available === false ? (
          <span className="inline-block rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-400">
            Rented
          </span>
        ) : null}
      </div>
      {renter && (
        <p className="mt-2 text-sm text-slate-300 font-mono">
          Renter: {String(renter).slice(0, 10)}…{String(renter).slice(-8)}
        </p>
      )}
      {expiry !== undefined && expiry > BigInt(0) && (
        <div className="mt-2">
          <ExpiryCountdown expiry={expiry} graceLabel="After expiry, name can be reclaimed." />
        </div>
      )}
      {explorerContract && (
        <p className="mt-3 text-xs text-zinc-400">
          <a href={explorerContract} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-200">
            View contract on explorer
          </a>
        </p>
      )}
    </div>
  );
}
