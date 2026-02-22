"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ARC_DOCS } from "@/lib/arc-docs";

export function WalletButton() {
  const [mounted, setMounted] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState<{ top: number; right: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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
      <a
        href={ARC_DOCS.connectToArc}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
      >
        Add Arc Testnet
      </a>
      <a
        href="https://faucet.circle.com"
        target="_blank"
        rel="noopener noreferrer"
        className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
      >
        Faucet
      </a>
      <a
        href={ARC_DOCS.bridgeUsdcToArc}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
      >
        Bridge USDC
      </a>
      <a
        href={ARC_DOCS.gasTracker}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
      >
        Gas Tracker
      </a>
      <div className="my-2 border-t border-white/10" />
      <p className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-slate-500">
        Docs & resources
      </p>
      <a
        href={ARC_DOCS.connectToArc}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
      >
        Connect to Arc
      </a>
      <a
        href={ARC_DOCS.deployOnArc}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
      >
        Deploy on Arc
      </a>
      <a
        href={ARC_DOCS.stableFeeDesign}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
      >
        Stable fee design
      </a>
      <a
        href={ARC_DOCS.gasAndFees}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
      >
        Gas and fees
      </a>
      <a
        href={ARC_DOCS.monitorEvents}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
      >
        Monitor events
      </a>
      <a
        href={ARC_DOCS.bridgeUsdcToArc}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
      >
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
        className="flex cursor-pointer list-none items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent"
      >
        Tools
        <svg
          className={`size-4 transition-transform ${toolsOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {toolsOpen &&
        typeof document !== "undefined" &&
        createPortal(toolsDropdownPanel, document.body)}
    </div>
  );

  return (
    <div className="flex items-center gap-3">
      {toolsDropdown}
      <ConnectButton />
    </div>
  );
}
