"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { ARC_TESTNET_CHAIN_ID } from "@/lib/contracts/DomainLease";
import { ARC_DOCS } from "@/lib/arc-docs";

export function WalletButton() {
  const [mounted, setMounted] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const isArc = chainId === ARC_TESTNET_CHAIN_ID;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!toolsOpen) return;
    const handler = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [toolsOpen]);

  if (!mounted) {
    return (
      <div className="h-10 w-32 animate-pulse rounded-full bg-zinc-800" aria-hidden />
    );
  }

  const toolsDropdown = (
    <div className="relative" ref={toolsRef}>
      <button
        type="button"
        onClick={() => setToolsOpen(!toolsOpen)}
        aria-expanded={toolsOpen}
        aria-haspopup="true"
        className="flex cursor-pointer list-none items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent"
      >
        Tools
        <svg className={`size-4 transition-transform ${toolsOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {toolsOpen && (
        <div className="absolute right-0 top-full z-[100] mt-2 min-w-[200px] rounded-xl border border-white/10 bg-[#0f0f1a] py-2 shadow-xl">
          <a href={ARC_DOCS.connectToArc} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
            Add Arc Testnet
          </a>
          <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
            Faucet
          </a>
          <a href={ARC_DOCS.bridgeUsdcToArc} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
            Bridge USDC
          </a>
          <a href={ARC_DOCS.gasTracker} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
            Gas Tracker
          </a>
          <div className="my-2 border-t border-white/10" />
          <p className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-slate-500">Docs & resources</p>
          <a href={ARC_DOCS.connectToArc} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
            Connect to Arc
          </a>
          <a href={ARC_DOCS.deployOnArc} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
            Deploy on Arc
          </a>
          <a href={ARC_DOCS.stableFeeDesign} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
            Stable fee design
          </a>
          <a href={ARC_DOCS.gasAndFees} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
            Gas and fees
          </a>
          <a href={ARC_DOCS.monitorEvents} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
            Monitor events
          </a>
          <a href={ARC_DOCS.bridgeUsdcToArc} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
            Bridge USDC
          </a>
        </div>
      )}
    </div>
  );

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        {toolsDropdown}
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
    <div className="flex items-center gap-3">
      {toolsDropdown}
      <button
        type="button"
        onClick={() => connect({ connector: connectors[0] })}
        disabled={isPending}
        className="rounded-lg bg-gradient-to-b from-[#4A90E2] to-[#2B60D4] px-6 py-2 font-medium text-white shadow-[0_0_15px_rgba(74,144,226,0.6)] hover:from-[#5BA0F2] hover:to-[#3C71E5] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#258cf4] focus:ring-offset-2 focus:ring-offset-[var(--background)] transition-all"
      >
        {isPending ? "Connecting…" : "Connect wallet"}
      </button>
    </div>
  );
}
