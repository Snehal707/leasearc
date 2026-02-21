# LeaseArc (Arc Testnet)

Frontend for onchain domain leasing. Search names, rent with USDC, manage records, resolve name to wallet.

## Setup

1. Deploy the contract from `../contracts` and set:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local and set NEXT_PUBLIC_DOMAIN_LEASE_ADDRESS to your deployed contract.
   ```
2. Install and run:
   ```bash
   npm install
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000). Connect your wallet, add [Arc Testnet](https://docs.arc.network/arc/references/connect-to-arc) (Chain ID 5042002), and get test [USDC](https://faucet.circle.com).

**Deploy to Vercel (next step):**
1. Push the repo to GitHub (if not already).
2. Go to [vercel.com](https://vercel.com) → New Project → Import the repo. Set the **Root Directory** to `app`.
3. Add Environment Variable: `NEXT_PUBLIC_DOMAIN_LEASE_ADDRESS` = your deployed contract address (e.g. `0xf887C928Fb1Ad6eF0895c77E320Ae60a7e236B14`).
4. Deploy. Your LeaseArc dApp will be live at a `*.vercel.app` URL.

## Pages

- **Search** – Check if a name is available or rented; see expiry countdown.
- **Rent** – Choose days (1–365), approve USDC, rent.
- **Manage** – As renter: renew and edit primary wallet, website, socials.
- **Resolve** – Enter a name to see the linked wallet (and optional website/socials).

Live activity on the home page shows recent contract events.

## Manual test flow

Smoke-test the dApp:

1. Connect your wallet and switch to **Arc Testnet** (Chain ID 5042002). Get test USDC from [Circle Faucet](https://faucet.circle.com) if needed.
2. **Search** – Enter a name (e.g. `snehal`), click Check. Confirm it shows Available or Rented.
3. **Rent** – If available, go to Rent (or use “Rent this name”), choose days, click Approve USDC, then Rent. Confirm success and the transaction link.
4. **Resolve** – Enter the same name, click Resolve. Confirm the linked wallet address matches your connected wallet (or the primary you set).
5. **Manage** – Enter the name you rent; renew (add days, approve USDC, Renew) or edit records (primary wallet, website, socials) and submit.
