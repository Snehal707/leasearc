export const DOMAIN_LEASE_ABI = [
  {
    type: "function",
    name: "available",
    inputs: [{ name: "name", type: "string", internalType: "string" }],
    outputs: [{ type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "rent",
    inputs: [
      { name: "name", type: "string", internalType: "string" },
      { name: "days_", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "renew",
    inputs: [
      { name: "tokenId", type: "uint256", internalType: "uint256" },
      { name: "days_", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "reclaim",
    inputs: [
      { name: "name", type: "string", internalType: "string" },
      { name: "days_", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setPrimary",
    inputs: [
      { name: "tokenId", type: "uint256", internalType: "uint256" },
      { name: "wallet", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setRecords",
    inputs: [
      { name: "tokenId", type: "uint256", internalType: "uint256" },
      { name: "primary", type: "address", internalType: "address" },
      { name: "_website", type: "string", internalType: "string" },
      { name: "_socials", type: "string", internalType: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "resolve",
    inputs: [{ name: "name", type: "string", internalType: "string" }],
    outputs: [{ type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTokenId",
    inputs: [{ name: "name", type: "string", internalType: "string" }],
    outputs: [{ type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRenter",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getExpiry",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRecords",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "primary", type: "address", internalType: "address" },
      { name: "_website", type: "string", internalType: "string" },
      { name: "_socials", type: "string", internalType: "string" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pricePerDay",
    inputs: [],
    outputs: [{ type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "expiry",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [{ type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "renter",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [{ type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "NameRented",
    inputs: [
      { name: "name", type: "string", indexed: false, internalType: "string" },
      { name: "renter", type: "address", indexed: true, internalType: "address" },
      { name: "expiry", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "daysRented", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "paid", type: "uint256", indexed: false, internalType: "uint256" },
    ],
  },
  {
    type: "event",
    name: "NameRenewed",
    inputs: [
      { name: "name", type: "string", indexed: false, internalType: "string" },
      { name: "renter", type: "address", indexed: true, internalType: "address" },
      { name: "newExpiry", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "daysAdded", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "paid", type: "uint256", indexed: false, internalType: "uint256" },
    ],
  },
  {
    type: "event",
    name: "NameReclaimed",
    inputs: [
      { name: "name", type: "string", indexed: false, internalType: "string" },
      { name: "newRenter", type: "address", indexed: true, internalType: "address" },
      { name: "newExpiry", type: "uint256", indexed: false, internalType: "uint256" },
    ],
  },
  {
    type: "event",
    name: "RecordUpdated",
    inputs: [
      { name: "name", type: "string", indexed: false, internalType: "string" },
      { name: "renter", type: "address", indexed: true, internalType: "address" },
      { name: "primaryWallet", type: "address", indexed: false, internalType: "address" },
    ],
  },
] as const;

export const USDC_ABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address", internalType: "address" },
      { name: "spender", type: "address", internalType: "address" },
    ],
    outputs: [{ type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
] as const;

export const USDC_ADDRESS = "0x3600000000000000000000000000000000000000" as const;

export const ARC_TESTNET_CHAIN_ID = 5042002;
