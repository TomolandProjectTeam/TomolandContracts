// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title  DappBayActivity
/// @notice Records daily wallet activity on-chain for DappBay DAU tracking.
///         DappBay counts unique FROM addresses per day — each user wallet must
///         call checkIn() directly so their address appears as the transaction sender.
contract DappBayActivity {
    address public owner;
    address public relay;

    /// @dev Stores the last UTC day (block.timestamp / 86400) each wallet checked in.
    ///      uint48 supports timestamps until year 8 million; packed to save gas.
    mapping(address => uint48) public lastActiveDay;

    event CheckedIn(address indexed wallet, uint256 indexed day);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(address _relay) {
        require(_relay != address(0), "zero address");
        owner = msg.sender;
        relay = _relay;
    }

    /// @notice Record activity for the calling wallet.
    ///         Silently no-ops if the wallet already checked in today (no revert).
    ///         Must be called from the user's own wallet address to count toward DAU.
    function checkIn() external {
        uint48 today = uint48(block.timestamp / 86400);
        if (lastActiveDay[msg.sender] >= today) return;
        lastActiveDay[msg.sender] = today;
        emit CheckedIn(msg.sender, today);
    }

    /// @notice Check whether a wallet has already checked in today.
    function hasCheckedInToday(address wallet) external view returns (bool) {
        return lastActiveDay[wallet] >= uint48(block.timestamp / 86400);
    }

    /// @notice Update the relay wallet address. Only callable by owner.
    function setRelay(address _relay) external onlyOwner {
        relay = _relay;
    }

    /// @notice Transfer contract ownership. Only callable by owner.
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "zero address");
        owner = _newOwner;
    }
}
