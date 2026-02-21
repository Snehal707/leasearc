# LeaseArc – Domain Leasing on Arc Testnet

Rent domain names for 1–365 days in USDC on Arc Testnet. Renew anytime; if you don’t renew, the name expires and anyone can reclaim it after a short grace period. Set records (primary wallet, website, socials) and resolve names to wallet addresses.

## Project structure

- **contracts/** – Solidity (Foundry): `DomainLease.sol`, tests, deploy script. See [contracts/README.md](contracts/README.md).
- **app/** – LeaseArc Next.js frontend: Search, Rent, Manage, Resolve pages and live contract events. See [app/README.md](app/README.md).

## Quick start

1. **Contracts:** Install [Foundry](https://getfoundry.sh/), then:
   ```bash
   cd contracts
   forge install foundry-rs/forge-std --no-commit
   cp .env.example .env   # set ARC_TESTNET_RPC_URL, PRIVATE_KEY
   forge build && forge test
   forge script script/Deploy.s.sol:DeployScript --rpc-url $env:ARC_TESTNET_RPC_URL --private-key $env:PRIVATE_KEY --broadcast
   ```
   Fund your wallet with test USDC at [faucet.circle.com](https://faucet.circle.com) (Arc Testnet).

2. **App:** Set the deployed contract address and run the app:
   ```bash
   cd app
   cp .env.local.example .env.local   # set NEXT_PUBLIC_DOMAIN_LEASE_ADDRESS
   npm install && npm run dev
   ```
   Open http://localhost:3000, connect your wallet, add [Arc Testnet](https://docs.arc.network/arc/references/connect-to-arc) (Chain ID 5042002).

**Production:** Deploy the `app` folder to Vercel (or similar). Set `NEXT_PUBLIC_DOMAIN_LEASE_ADDRESS` to your deployed contract address in the project’s environment variables.

## Links

- [Connect to Arc](https://docs.arc.network/arc/references/connect-to-arc) – RPC, Chain ID, wallet setup
- [Deploy on Arc](https://docs.arc.network/arc/tutorials/deploy-on-arc) – Foundry deploy (entry point for setup)
- [Bridge USDC to Arc](https://docs.arc.network/arc/tutorials/bridge-usdc-to-arc) – Get USDC on Arc
- [Gas and fees](https://docs.arc.network/arc/references/gas-and-fees) – USDC gas
- [Arc Testnet Explorer](https://testnet.arcscan.app)
