"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import type { Chain } from "@rainbow-me/rainbowkit";

const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
} as const satisfies Chain;

// WalletConnect projectId (public); set in Vercel env or .env.local to override
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  "b2c9f33b354a862b2935f0a1db30cce1";

export const config = getDefaultConfig({
  appName: "LeaseArc",
  projectId,
  chains: [arcTestnet],
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
