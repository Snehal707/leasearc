"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NetworkBadge } from "./ui/NetworkBadge";
import { WalletButton } from "./ui/WalletButton";

function Logo() {
  return (
    <svg width="40" height="40" viewBox="0 0 100 100" className="shrink-0 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" aria-hidden>
      <path d="M50 15 L30 80 M50 15 L70 80 M35 60 L65 60" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="50" cy="55" rx="45" ry="18" stroke="currentColor" strokeWidth="4" fill="none" transform="rotate(-15 50 55)" className="opacity-70" />
    </svg>
  );
}

export function TopNav() {
  const pathname = usePathname();
  const navLinks = [
    { href: "/search", label: "Search" },
    { href: "/rent", label: "Rent" },
    { href: "/manage", label: "Manage" },
    { href: "/resolve", label: "Resolve" },
  ];

  return (
    <nav className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-white/[0.06] bg-black/30 px-10 backdrop-blur-xl" aria-label="Main">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-4 rounded-xl px-2 py-2 transition-colors hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent">
          <Logo />
          <span className="font-heading text-2xl font-bold tracking-tight text-white drop-shadow-lg">LeaseArc</span>
        </Link>
      </div>
      <div className="hidden md:flex flex-1 items-center justify-center gap-8">
        {navLinks.map(({ href, label }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all ${
                isActive
                  ? "font-heading font-medium text-white bg-white/10 shadow-sm"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
      <div className="flex items-center gap-4">
        <NetworkBadge />
        <WalletButton />
      </div>
    </nav>
  );
}
