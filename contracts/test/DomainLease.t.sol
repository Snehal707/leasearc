// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/DomainLease.sol";
import "../src/IERC20.sol";

contract MockUSDC is IERC20 {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        if (allowance[from][msg.sender] != type(uint256).max) {
            allowance[from][msg.sender] -= amount;
        }
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }
}

contract DomainLeaseTest is Test {
    DomainLease public lease;
    MockUSDC public usdc;

    address public owner = address(1);
    address public alice = address(2);
    address public bob = address(3);

    function setUp() public {
        usdc = new MockUSDC();
        usdc.mint(alice, 1000 * 1e6);
        usdc.mint(bob, 1000 * 1e6);
        vm.prank(owner);
        lease = new DomainLease(address(usdc), 1e6); // 1 USDC per day
    }

    function test_AvailableWhenNoRent() public view {
        assertTrue(lease.available("myname"));
    }

    function test_RentAndResolve() public {
        vm.startPrank(alice);
        usdc.approve(address(lease), 30 * 1e6);
        lease.rent("myname", 30);
        assertEq(lease.resolve("myname"), alice);
        assertFalse(lease.available("myname"));
        vm.stopPrank();
    }

    function test_AvailableAfterExpiryAndGrace() public {
        vm.startPrank(alice);
        usdc.approve(address(lease), 1 * 1e6);
        lease.rent("myname", 1); // 1 day
        vm.stopPrank();
        vm.warp(block.timestamp + 1 days + 1 hours + 1);
        assertTrue(lease.available("myname"));
    }

    function test_SetPrimaryAndResolve() public {
        vm.prank(alice);
        usdc.approve(address(lease), 30 * 1e6);
        vm.prank(alice);
        lease.rent("myname", 30);
        vm.prank(alice);
        lease.setPrimary(1, bob);
        assertEq(lease.resolve("myname"), bob);
    }

    function test_RevertRentWhenNotAvailable() public {
        vm.prank(alice);
        usdc.approve(address(lease), 60 * 1e6);
        vm.prank(alice);
        lease.rent("myname", 30);
        vm.prank(bob);
        usdc.approve(address(lease), 30 * 1e6);
        vm.prank(bob);
        vm.expectRevert(DomainLease.NotAvailable.selector);
        lease.rent("myname", 30);
    }

    function test_RenewExtendsExpiry() public {
        vm.startPrank(alice);
        usdc.approve(address(lease), 100 * 1e6);
        lease.rent("myname", 30);
        uint256 exp1 = lease.expiry(1);
        lease.renew(1, 10);
        uint256 exp2 = lease.expiry(1);
        assertEq(exp2, exp1 + 10 days);
        vm.stopPrank();
    }

    function test_ReclaimAfterGrace() public {
        vm.prank(alice);
        usdc.approve(address(lease), 10 * 1e6);
        vm.prank(alice);
        lease.rent("myname", 1);
        vm.warp(block.timestamp + 1 days + 1 hours + 1);
        vm.prank(bob);
        usdc.approve(address(lease), 30 * 1e6);
        vm.prank(bob);
        lease.reclaim("myname", 30);
        assertEq(lease.renter(1), bob);
        assertEq(lease.resolve("myname"), bob);
    }
}
