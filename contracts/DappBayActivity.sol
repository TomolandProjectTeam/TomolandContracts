// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DappBayActivity {
    address public owner;
    address public relay;

    event ActivityRecorded(address indexed wallet, uint256 indexed date);

    modifier onlyRelay() {
        require(msg.sender == relay, "not relay");
        _;
    }

    constructor(address _relay) {
        owner = msg.sender;
        relay = _relay;
    }

    /// @notice Report a batch of active wallet addresses for a given date.
    /// @param wallets  List of BSC wallet addresses active that day.
    /// @param date     Date in YYYYMMDD format, e.g. 20260409.
    function recordBatchActivity(
        address[] calldata wallets,
        uint256 date
    ) external onlyRelay {
        for (uint256 i = 0; i < wallets.length; i++) {
            emit ActivityRecorded(wallets[i], date);
        }
    }

    /// @notice Update the relay wallet address. Only callable by owner.
    function setRelay(address _relay) external {
        require(msg.sender == owner, "not owner");
        relay = _relay;
    }

    /// @notice Transfer contract ownership to a new address. Only callable by owner.
    function transferOwnership(address _newOwner) external {
        require(msg.sender == owner, "not owner");
        require(_newOwner != address(0), "zero address");
        owner = _newOwner;
    }
}
