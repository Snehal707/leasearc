"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { ARC_TESTNET_CHAIN_ID } from "@/lib/contracts/DomainLease";
import { ARC_DOCS } from "@/lib/arc-docs";

export function WalletButton() {
  const [mounted, setMounted] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [walletPickerOpen, setWalletPickerOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState<{ top: number; right: number } | null>(null);
  const [walletPanelPosition, setWalletPanelPosition] = useState<{ top: number; right: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const walletTriggerRef = useRef<HTMLButtonElement>(null);
  const walletPanelRef = useRef<HTMLDivElement>(null);
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const isArc = chainId === ARC_TESTNET_CHAIN_ID;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!toolsOpen || !triggerRef.current) return;
    const updatePosition = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPanelPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
      }
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [toolsOpen]);

  useEffect(() => {
    if (!toolsOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const inTrigger = triggerRef.current?.contains(target);
      const inPanel = panelRef.current?.contains(target);
      if (!inTrigger && !inPanel) setToolsOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [toolsOpen]);

  useEffect(() => {
    if (!walletPickerOpen || !walletTriggerRef.current) return;
    const updatePosition = () => {
      if (walletTriggerRef.current) {
        const rect = walletTriggerRef.current.getBoundingClientRect();
        setWalletPanelPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
      }
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [walletPickerOpen]);

  useEffect(() => {
    if (!walletPickerOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const inTrigger = walletTriggerRef.current?.contains(target);
      const inPanel = walletPanelRef.current?.contains(target);
      if (!inTrigger && !inPanel) setWalletPickerOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [walletPickerOpen]);

  if (!mounted) {
    return (
      <div className="h-10 w-32 animate-pulse rounded-full bg-zinc-800" aria-hidden />
    );
  }

  const toolsDropdownPanel = panelPosition && (
    <div
      ref={panelRef}
      className="fixed z-[100] min-w-[200px] rounded-xl border border-white/10 bg-[#0f0f1a] py-2 shadow-xl"
      style={{ top: panelPosition.top, right: panelPosition.right }}
    >
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
  );

  const toolsDropdown = (
    <div className="relative">
      <button
        ref={triggerRef}
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
      {toolsOpen && typeof document !== "undefined" && createPortal(toolsDropdownPanel, document.body)}
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

  const recentConnectorId = typeof window !== "undefined" ? localStorage.getItem("leasearc-recent-wallet") : null;

  const walletPickerPanel = walletPanelPosition && (
    <div
      ref={walletPanelRef}
      className="fixed z-[100] min-w-[280px] max-h-[320px] overflow-y-auto rounded-xl border border-white/10 bg-[#0f0f1a] py-2 shadow-xl"
      style={{ top: walletPanelPosition.top, right: walletPanelPosition.right }}
    >
      <p className="px-4 py-2 text-[10px] uppercase tracking-wider text-slate-500">Choose wallet</p>
      <div className="divide-y divide-white/5">
        {connectors.map((connector) => {
          const isRecent = recentConnectorId === connector.uid;
          const iconUrl = connector.name.includes("MetaMask")
            ? "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
            : connector.name.includes("OKX")
              ? "https://www.okx.com/favicon.ico"
              : null;
          return (
            <button
              key={connector.uid}
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") localStorage.setItem("leasearc-recent-wallet", connector.uid);
                connect({ connector });
                setWalletPickerOpen(false);
              }}
              disabled={isPending}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 disabled:opacity-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10">
                {iconUrl ? (
                  <img src={iconUrl} alt="" className="h-6 w-6 object-contain" />
                ) : (
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                  </svg>
                )}
              </div>
              <span className="flex-1 text-sm font-medium text-white">{connector.name}</span>
              {isRecent ? (
                <span className="rounded-full bg-violet-500/30 px-2.5 py-0.5 text-[10px] font-medium text-violet-300">Recent</span>
              ) : (
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] text-slate-400">Detected</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex items-center gap-3">
      {toolsDropdown}
      <div className="relative">
        <button
          ref={walletTriggerRef}
          type="button"
          onClick={() => setWalletPickerOpen(!walletPickerOpen)}
          disabled={isPending}
          aria-expanded={walletPickerOpen}
          aria-haspopup="true"
          className="rounded-lg bg-gradient-to-b from-[#4A90E2] to-[#2B60D4] px-6 py-2 font-medium text-white shadow-[0_0_15px_rgba(74,144,226,0.6)] hover:from-[#5BA0F2] hover:to-[#3C71E5] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#258cf4] focus:ring-offset-2 focus:ring-offset-[var(--background)] transition-all"
        >
          {isPending ? "Connecting…" : "Connect wallet"}
        </button>
        {walletPickerOpen && typeof document !== "undefined" && createPortal(walletPickerPanel, document.body)}
      </div>
    </div>
  );
}
