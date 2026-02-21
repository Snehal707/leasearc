"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { ARC_TESTNET_CHAIN_ID } from "@/lib/contracts/DomainLease";
import { ARC_DOCS } from "@/lib/arc-docs";

export function WalletButton() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const isArc = chainId === ARC_TESTNET_CHAIN_ID;

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-10 w-32 animate-pulse rounded-full bg-zinc-800" aria-hidden />
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        {!isArc && (
          <button
            type="button"
            onClick={() => switchChain({ chainId: ARC_TESTNET_CHAIN_ID })}
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-transparent"
          >
            Switch to Arc Testnet
          </button>
        )}
        <span
          className="max-w-[140px] truncate rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-sm text-slate-200"
          title={address}
        >
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
        <button
          type="button"
          onClick={() => disconnect()}
          className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-300 transition-colors hover:bg-rose-500/20 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-transparent"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => connect({ connector: connectors[0] })}
        disabled={isPending}
        className="rounded-lg bg-gradient-to-b from-[#4A90E2] to-[#2B60D4] px-6 py-2 font-medium text-white shadow-[0_0_15px_rgba(74,144,226,0.6)] hover:from-[#5BA0F2] hover:to-[#3C71E5] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#258cf4] focus:ring-offset-2 focus:ring-offset-[var(--background)] transition-all"
      >
        {isPending ? "Connecting…" : "Connect wallet"}
      </button>
      <p className="text-xs text-zinc-400">
        <a href={ARC_DOCS.connectToArc} target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-300">
          Add Arc Testnet
        </a>
        {" · "}
        <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-300">
          Faucet
        </a>
        {" · "}
        <a href={ARC_DOCS.bridgeUsdcToArc} target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-300">
          Bridge USDC
        </a>
        {" · "}
        <a href={ARC_DOCS.gasTracker} target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-300">
          ~$0.01 per tx — Gas Tracker
        </a>
      </p>
    </div>
  );
}
