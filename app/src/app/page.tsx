import Link from "next/link";
import { TopNav } from "./components/TopNav";
import { LiveEvents } from "./components/LiveEvents";
import { ARC_DOCS } from "@/lib/arc-docs";

export default function Home() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-heading text-4xl font-medium tracking-tight text-white text-premium md:text-5xl">
          LeaseArc – Onchain domain leasing on Arc Testnet
        </h1>
        <p className="mt-5 font-light leading-loose text-slate-200/90 max-w-lg mx-auto">
          Rent a name for 1–365 days in USDC; renew or it expires and others can reclaim it. ~1¢ per tx · 1 second finality.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/search"
            className="rounded-xl bg-blue-600 px-8 py-3.5 font-medium tracking-wide text-white hover:bg-blue-500 transition-colors"
          >
            Search a name
          </Link>
          <Link
            href="/rent"
            className="rounded-xl border border-white/10 px-8 py-3.5 font-medium tracking-wide text-slate-200 hover:bg-white/5 transition-colors"
          >
            Rent a name
          </Link>
          <Link
            href="/resolve"
            className="rounded-xl border border-white/10 px-8 py-3.5 font-medium tracking-wide text-slate-200 hover:bg-white/5 transition-colors"
          >
            Resolve name → wallet
          </Link>
        </div>
        <div className="mt-12 text-left max-w-xl mx-auto">
          <LiveEvents />
        </div>
        <footer className="mt-16 border-t border-white/5 pt-8 text-center uppercase tracking-widest text-[10px] text-slate-500">
          <a href={ARC_DOCS.connectToArc} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-200">Connect to Arc</a>
          {" · "}
          <a href={ARC_DOCS.deployOnArc} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-200">Deploy on Arc</a>
          {" · "}
          <a href={ARC_DOCS.stableFeeDesign} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-200">Stable fee design</a>
          {" · "}
          <a href={ARC_DOCS.gasAndFees} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-200">Gas and fees</a>
          {" · "}
          <a href={ARC_DOCS.monitorEvents} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-200">Monitor events</a>
          {" · "}
          <a href={ARC_DOCS.bridgeUsdcToArc} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-200">Bridge USDC</a>
        </footer>
      </main>
    </div>
  );
}
