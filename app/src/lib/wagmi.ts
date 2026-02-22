"use client";

import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";

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
};

const metaMaskConnector = injected({ target: "metaMask" });

const okxConnector = injected({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target() {
    if (typeof window === "undefined") return undefined;
    const okx = (window as { okxwallet?: { ethereum?: unknown } }).okxwallet;
    const provider = okx?.ethereum ?? okx;
    return provider ? { id: "okx", name: "OKX Wallet", provider: provider as any } : undefined;
  },
});

export const config = createConfig({
  chains: [arcTestnet],
  connectors: [metaMaskConnector, okxConnector, injected()],
  multiInjectedProviderDiscovery: false,
  transports: {
    [arcTestnet.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
