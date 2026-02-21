# Domain Leasing Contract (Arc Testnet)

Rent domain names for 1–365 days in USDC. Renew or let it expire; after a grace period anyone can reclaim.

## Setup

1. Set `ARC_TESTNET_RPC_URL` and `PRIVATE_KEY` in a `.env` file (project root or this folder). See `.env.example`. Get test USDC: [Circle Faucet](https://faucet.circle.com) → Arc Testnet → your wallet address.

### Local install (Windows)

No system-wide Foundry needed. From the `contracts/` folder:

```powershell
.\install-foundry.ps1   # once: downloads Foundry into .foundry/bin and installs forge-std
.\deploy.ps1            # build, test, deploy to Arc Testnet; updates app/.env.local
```

### System-wide Foundry (optional)

1. Install [Foundry](https://getfoundry.sh/): `curl -L https://foundry.paradigm.xyz | bash` then `foundryup`.
2. Install deps: `forge install foundry-rs/forge-std --no-commit`.

## Build & Test

```bash
forge build
forge test
```

## Deploy

**Option A – PowerShell script (loads `.env` and updates app `.env.local`):**
```powershell
.\deploy.ps1
```
Uses local `.foundry/bin/forge.exe` if you ran `.\install-foundry.ps1`, otherwise `forge` in PATH. Put your real `PRIVATE_KEY` in `.env` (do not commit `.env`).

**Option B – Manual:**
```powershell
# Load .env (PowerShell): run deploy.ps1 once to see how it loads, or set by hand:
$env:ARC_TESTNET_RPC_URL = "https://rpc.testnet.arc.network"
$env:PRIVATE_KEY = "0x..."

forge script script/Deploy.s.sol:DeployScript --rpc-url $env:ARC_TESTNET_RPC_URL --private-key $env:PRIVATE_KEY --broadcast
```
Save the printed `DomainLease deployed at: 0x...` into `app/.env.local` as `NEXT_PUBLIC_DOMAIN_LEASE_ADDRESS=0x...`.

## Interact from terminal (prove it works)

Replace `$CONTRACT` with your deployed address and `$RPC` with `$ARC_TESTNET_RPC_URL`.

**Check if a name is available:**
```bash
cast call $CONTRACT "available(string)(bool)" "myname" --rpc-url $RPC
```

**Rent (after approving USDC):**  
USDC on Arc Testnet: `0x3600000000000000000000000000000000000000`.  
Approve 30 USDC (30 * 1e6 for 6 decimals):
```bash
cast send 0x3600000000000000000000000000000000000000 "approve(address,uint256)" $CONTRACT 30000000 --rpc-url $RPC --private-key $PRIVATE_KEY
cast send $CONTRACT "rent(string,uint256)" "myname" 30 --rpc-url $RPC --private-key $PRIVATE_KEY
```

**Resolve name to wallet:**
```bash
cast call $CONTRACT "resolve(string)(address)" "myname" --rpc-url $RPC
```

**Set primary address (as renter, tokenId 1):**
```bash
cast send $CONTRACT "setPrimary(uint256,address)" 1 0xYourPrimaryWallet --rpc-url $RPC --private-key $PRIVATE_KEY
```

**Renew (add 10 days, pay 10 USDC):**
```bash
cast send 0x3600000000000000000000000000000000000000 "approve(address,uint256)" $CONTRACT 10000000 --rpc-url $RPC --private-key $PRIVATE_KEY
cast send $CONTRACT "renew(uint256,uint256)" 1 10 --rpc-url $RPC --private-key $PRIVATE_KEY
```

View contract and events on [Arc Testnet Explorer](https://testnet.arcscan.app).
