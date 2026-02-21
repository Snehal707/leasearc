"use client";

import Link from "next/link";
import { ConnectWallet } from "./ConnectWallet";

export function Nav() {
  return (
    <nav className="border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link href="/" className="font-semibold text-zinc-900">
          LeaseArc
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/search" className="text-sm text-zinc-600 hover:text-zinc-900">
            Search
          </Link>
          <Link href="/rent" className="text-sm text-zinc-600 hover:text-zinc-900">
            Rent
          </Link>
          <Link href="/manage" className="text-sm text-zinc-600 hover:text-zinc-900">
            Manage
          </Link>
          <Link href="/resolve" className="text-sm text-zinc-600 hover:text-zinc-900">
            Resolve
          </Link>
          <ConnectWallet />
        </div>
      </div>
    </nav>
  );
}
