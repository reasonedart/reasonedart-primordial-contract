//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "pablock-smart-contracts/contracts/PablockMetaTxReceiver.sol";

contract ReasonedArtData is PablockMetaTxReceiver {
    address private contractOwner;

    mapping(address => bool) private whitelistedDestinations;

    constructor(
        string memory _name,
        string memory _version,
        address _owner
    ) PablockMetaTxReceiver(_name, _version) {
        contractOwner = _owner;
    }

    modifier onlyOwner() {
        require(contractOwner == msgSender(), "Sender is not contract owner");
        _;
    }

    function initializeMetaTransaction(address _metaTxAddress)
        public
        onlyOwner
    {
        setMetaTransaction(_metaTxAddress);
    }

    function setWhitelistedDestination(address contractAddress)
        public
        onlyOwner
    {
        whitelistedDestinations[contractAddress] = true;
    }

    function getWhitelistedDestinationStatus(address contractAddress)
        public
        view
        returns (bool)
    {
        return whitelistedDestinations[contractAddress];
    }
}
