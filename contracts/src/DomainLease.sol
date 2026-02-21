// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IERC20.sol";

contract DomainLease {
    IERC20 public immutable usdc;

    uint256 public constant MIN_DAYS = 1;
    uint256 public constant MAX_DAYS = 365;
    uint256 public constant GRACE_PERIOD = 1 hours; // 1 hour for testnet demo

    uint256 public pricePerDay; // USDC 6 decimals
    uint256 public nextTokenId;

    mapping(bytes32 => uint256) public nameHashToTokenId;
    mapping(uint256 => address) public renter;
    mapping(uint256 => uint256) public expiry;
    mapping(uint256 => address) public primaryAddress;
    mapping(uint256 => string) public website;
    mapping(uint256 => string) public socials;
    mapping(uint256 => string) public tokenIdToName;

    address public owner;

    event NameRented(string name, address indexed renter, uint256 expiry, uint256 daysRented, uint256 paid);
    event NameRenewed(string name, address indexed renter, uint256 newExpiry, uint256 daysAdded, uint256 paid);
    event NameReclaimed(string name, address indexed newRenter, uint256 newExpiry);
    event RecordUpdated(string name, address indexed renter, address primaryWallet);

    error NotAvailable();
    error InvalidDays();
    error NotRenter();
    error TransferFailed();

    constructor(address _usdc, uint256 _pricePerDay) {
        usdc = IERC20(_usdc);
        pricePerDay = _pricePerDay;
        owner = msg.sender;
    }

    function _normalize(string memory name) internal pure returns (string memory) {
        bytes memory b = bytes(name);
        if (b.length == 0) return name;
        bytes memory res = new bytes(b.length);
        for (uint256 i = 0; i < b.length; i++) {
            if (b[i] >= 0x41 && b[i] <= 0x5A) {
                res[i] = bytes1(uint8(b[i]) + 32);
            } else {
                res[i] = b[i];
            }
        }
        return string(res);
    }

    function _trim(string memory name) internal pure returns (string memory) {
        bytes memory b = bytes(name);
        if (b.length == 0) return name;
        uint256 start = 0;
        while (start < b.length && (b[start] == 0x20 || b[start] == 0x09)) start++;
        uint256 end = b.length;
        while (end > start && (b[end - 1] == 0x20 || b[end - 1] == 0x09)) end--;
        if (start >= end) return "";
        bytes memory res = new bytes(end - start);
        for (uint256 i = 0; i < end - start; i++) res[i] = b[start + i];
        return string(res);
    }

    function _nameHash(string memory name) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_normalize(_trim(name))));
    }

    function available(string calldata name) public view returns (bool) {
        bytes32 h = _nameHash(name);
        uint256 tid = nameHashToTokenId[h];
        if (tid == 0) return true;
        return block.timestamp >= expiry[tid] + GRACE_PERIOD;
    }

    function rent(string calldata name, uint256 days_) external {
        if (!available(name)) revert NotAvailable();
        if (days_ < MIN_DAYS || days_ > MAX_DAYS) revert InvalidDays();

        uint256 totalPrice = days_ * pricePerDay;
        bool ok = usdc.transferFrom(msg.sender, address(this), totalPrice);
        if (!ok) revert TransferFailed();

        nextTokenId++;
        uint256 tokenId = nextTokenId;
        bytes32 h = _nameHash(name);
        nameHashToTokenId[h] = tokenId;
        renter[tokenId] = msg.sender;
        expiry[tokenId] = block.timestamp + (days_ * 1 days);
        tokenIdToName[tokenId] = name;

        emit NameRented(name, msg.sender, expiry[tokenId], days_, totalPrice);
    }

    function renew(uint256 tokenId, uint256 days_) external {
        if (msg.sender != renter[tokenId]) revert NotRenter();
        if (days_ == 0 || days_ > MAX_DAYS) revert InvalidDays();

        uint256 totalPrice = days_ * pricePerDay;
        bool ok = usdc.transferFrom(msg.sender, address(this), totalPrice);
        if (!ok) revert TransferFailed();

        uint256 base = expiry[tokenId] > block.timestamp ? expiry[tokenId] : block.timestamp;
        uint256 newExpiry = base + (days_ * 1 days);
        expiry[tokenId] = newExpiry;

        string memory name = tokenIdToName[tokenId];
        emit NameRenewed(name, msg.sender, newExpiry, days_, totalPrice);
    }

    function reclaim(string calldata name, uint256 days_) external {
        if (!available(name)) revert NotAvailable();
        if (days_ < MIN_DAYS || days_ > MAX_DAYS) revert InvalidDays();

        uint256 totalPrice = days_ * pricePerDay;
        bool ok = usdc.transferFrom(msg.sender, address(this), totalPrice);
        if (!ok) revert TransferFailed();

        bytes32 h = _nameHash(name);
        uint256 existingId = nameHashToTokenId[h];
        uint256 tokenId;
        if (existingId != 0) {
            tokenId = existingId;
            renter[tokenId] = msg.sender;
            expiry[tokenId] = block.timestamp + (days_ * 1 days);
            tokenIdToName[tokenId] = name;
        } else {
            nextTokenId++;
            tokenId = nextTokenId;
            nameHashToTokenId[h] = tokenId;
            renter[tokenId] = msg.sender;
            expiry[tokenId] = block.timestamp + (days_ * 1 days);
            tokenIdToName[tokenId] = name;
        }

        emit NameReclaimed(name, msg.sender, expiry[tokenId]);
    }

    function setPrimary(uint256 tokenId, address wallet) external {
        if (msg.sender != renter[tokenId]) revert NotRenter();
        primaryAddress[tokenId] = wallet;
        emit RecordUpdated(tokenIdToName[tokenId], msg.sender, wallet);
    }

    function setRecords(uint256 tokenId, address primary, string calldata _website, string calldata _socials) external {
        if (msg.sender != renter[tokenId]) revert NotRenter();
        primaryAddress[tokenId] = primary;
        website[tokenId] = _website;
        socials[tokenId] = _socials;
        emit RecordUpdated(tokenIdToName[tokenId], msg.sender, primary);
    }

    function resolve(string calldata name) external view returns (address) {
        bytes32 h = _nameHash(name);
        uint256 tokenId = nameHashToTokenId[h];
        if (tokenId == 0) return address(0);
        if (block.timestamp > expiry[tokenId]) return address(0);
        address primary = primaryAddress[tokenId];
        if (primary != address(0)) return primary;
        return renter[tokenId];
    }

    function getTokenId(string calldata name) external view returns (uint256) {
        return nameHashToTokenId[_nameHash(name)];
    }

    function getRenter(uint256 tokenId) external view returns (address) {
        return renter[tokenId];
    }

    function getExpiry(uint256 tokenId) external view returns (uint256) {
        return expiry[tokenId];
    }

    function getRecords(uint256 tokenId) external view returns (address primary, string memory _website, string memory _socials) {
        primary = primaryAddress[tokenId] != address(0) ? primaryAddress[tokenId] : renter[tokenId];
        _website = website[tokenId];
        _socials = socials[tokenId];
    }

    function withdraw() external {
        require(msg.sender == owner, "Not owner");
        uint256 bal = usdc.balanceOf(address(this));
        if (bal > 0) {
            bool ok = usdc.transfer(owner, bal);
            if (!ok) revert TransferFailed();
        }
    }
}
