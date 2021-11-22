//SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "pablock-smartcontracts/contracts/PablockMetaTxReceiver.sol";

contract ReasonedArtData is PablockMetaTxReceiver {
  address private contractOwner;

  mapping(address => bool) private whitelistedDestinations;

  constructor(
    string memory _name,
    string memory _version,
    address _metaTxAddress,
    address _owner
  ) PablockMetaTxReceiver(_name, _version, _metaTxAddress) {
    contractOwner = _owner;
  }

  modifier onlyOwner() {
    require(contractOwner == msgSender(), "Sender is not contract owner");
    _;
  }

  function setWhitelistedDestination(address contractAddress) public onlyOwner {
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
