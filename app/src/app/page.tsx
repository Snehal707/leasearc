import Link from "next/link";
import { TopNav } from "./components/TopNav";
import { LiveEvents } from "./components/LiveEvents";

export default function Home() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="relative pt-6">
        <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1fr_380px] xl:gap-12 xl:items-start xl:max-w-7xl xl:mx-auto xl:px-8">
          <div className="relative max-w-2xl pl-6 pr-4 py-16 md:pl-16 lg:pl-24 xl:pl-8 xl:py-12 text-left">
            {/* Localized vignette behind hero text only */}
            <div className="absolute inset-0 -z-10 max-w-[600px] bg-gradient-to-r from-black/50 via-black/25 to-transparent pointer-events-none rounded-r-2xl" aria-hidden />
            <h1 className="font-heading hero-text-glow text-3xl font-medium tracking-tight text-white md:text-4xl max-w-[560px]">
              LeaseArc Onchain domains on Arc Testnet
            </h1>
            <p className="mt-3 font-normal leading-relaxed text-slate-200/85 max-w-[560px] hero-text-glow">
              Rent any name for 1 to 365 days in USDC, renew anytime, set records, resolve to wallet.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/search"
                className="rounded-xl bg-blue-600 px-8 py-3.5 font-medium tracking-wide text-white hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#02040A]"
              >
                Search domains
              </Link>
              <Link
                href="/rent"
                className="rounded-xl border border-white/20 px-4 py-2 text-xs font-medium tracking-wide text-slate-200 hover:border-white/40 hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#02040A]"
              >
                Start leasing
              </Link>
              <Link
                href="/resolve"
                className="rounded-xl border border-white/20 px-4 py-2 text-xs font-medium tracking-wide text-slate-200 hover:border-white/40 hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#02040A]"
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
          <div className="relative z-10 mt-6 xl:mt-0 w-full xl:w-[380px] xl:shrink-0 pl-6 pr-4 md:pl-16 lg:pl-24 xl:pl-0 xl:pr-8">
            <LiveEvents />
          </div>
        </div>
      </main>
    </div>
  );
}
