export function getDomainLeaseAddress(): `0x${string}` {
  const addr = process.env.NEXT_PUBLIC_DOMAIN_LEASE_ADDRESS;
  if (!addr || !addr.startsWith("0x")) {
    return "0x0000000000000000000000000000000000000000" as `0x${string}`;
  }
  return addr as `0x${string}`;
}
