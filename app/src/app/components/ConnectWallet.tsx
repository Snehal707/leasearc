"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { ARC_TESTNET_CHAIN_ID } from "@/lib/contracts/DomainLease";
import { ARC_DOCS } from "@/lib/arc-docs";

export function ConnectWallet() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const isArc = chainId === ARC_TESTNET_CHAIN_ID;

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex flex-col gap-2 text-sm">
        <div className="rounded-lg bg-zinc-200 px-4 py-2 h-10 w-32 animate-pulse" />
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        {!isArc && (
          <button
            type="button"
            onClick={() => switchChain({ chainId: ARC_TESTNET_CHAIN_ID })}
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-black"
          >
            Switch to Arc Testnet
          </button>
        )}
        <span className="truncate text-sm text-zinc-500 font-mono max-w-[140px]">
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
        <button
          type="button"
          onClick={() => disconnect()}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      <button
        type="button"
        onClick={() => connect({ connector: connectors[0] })}
        disabled={isPending}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {isPending ? "Connecting…" : "Connect wallet"}
      </button>
      <p className="text-zinc-500">
        Add <a href={ARC_DOCS.connectToArc} target="_blank" rel="noopener noreferrer" className="underline">Arc Testnet</a> and get test <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer" className="underline">USDC</a>.
      </p>
    </div>
  );
}
