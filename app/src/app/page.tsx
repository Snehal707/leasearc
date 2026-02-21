import Link from "next/link";
import { TopNav } from "./components/TopNav";
import { LiveEvents } from "./components/LiveEvents";
import { ARC_DOCS } from "@/lib/arc-docs";

export default function Home() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="relative">
        {/* Hero gradient overlay for readability over planet */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#02040A] via-[#02040A]/95 to-transparent pointer-events-none z-0" aria-hidden />
        <div className="relative z-10 max-w-4xl pl-6 pr-4 py-16 md:pl-16 lg:pl-24 text-left">
          <h1 className="font-heading text-4xl font-medium tracking-tight text-white text-premium md:text-5xl max-w-[760px]">
            LeaseArc Onchain domains on Arc Testnet
          </h1>
          <p className="mt-3 font-light leading-relaxed text-slate-200/70 max-w-[640px]">
            Rent any name for 1 to 365 days in USDC, renew anytime, set records, resolve to wallet.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/search"
              className="rounded-xl bg-blue-600 px-8 py-3.5 font-medium tracking-wide text-white hover:bg-blue-500 transition-colors"
            >
              Search domains
            </Link>
            <Link
              href="/rent"
              className="rounded-xl border border-white/20 px-8 py-3.5 font-medium tracking-wide text-slate-200 hover:border-white/40 hover:bg-white/5 transition-colors"
            >
              Start leasing
            </Link>
            <Link
              href="/resolve"
              className="rounded-xl border border-white/20 px-8 py-3.5 font-medium tracking-wide text-slate-200 hover:border-white/40 hover:bg-white/5 transition-colors"
            >
              Resolve name to wallet
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
              ~1¢ per tx
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
              ~1s finality
            </span>
          </div>
        </div>
        <div className="relative z-10 mt-12 max-w-xl pl-6 pr-4 md:pl-16 lg:pl-24">
          <LiveEvents />
        </div>
        <footer className="relative z-10 mt-16 border-t border-white/5 pt-8 px-6 md:px-16 lg:px-24 text-center">
          <div className="flex flex-wrap justify-center gap-4 uppercase tracking-widest text-xs text-slate-400">
            <a href={ARC_DOCS.connectToArc} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-200">Connect to Arc</a>
            <a href={ARC_DOCS.deployOnArc} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-200">Deploy on Arc</a>
            <a href={ARC_DOCS.stableFeeDesign} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-200">Stable fee design</a>
            <a href={ARC_DOCS.gasAndFees} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-200">Gas and fees</a>
            <a href={ARC_DOCS.monitorEvents} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-200">Monitor events</a>
            <a href={ARC_DOCS.bridgeUsdcToArc} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-200">Bridge USDC</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
