// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/DomainLease.sol";

contract DeployScript is Script {
    address constant USDC_ARC_TESTNET = 0x3600000000000000000000000000000000000000; // Arc Testnet USDC

    function run() external returns (DomainLease) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        uint256 pricePerDay = 1e6; // 1 USDC per day (6 decimals)
        vm.startBroadcast(deployerPrivateKey);
        DomainLease lease = new DomainLease(USDC_ARC_TESTNET, pricePerDay);
        vm.stopBroadcast();
        console.log("DomainLease deployed at:", address(lease));
        return lease;
    }
}
