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

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

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
