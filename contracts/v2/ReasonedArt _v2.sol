//SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "pablock-smartcontracts/contracts/PablockMetaTxReceiver.sol";

import "hardhat/console.sol";

contract ReasonedArtV2 is ERC721, PablockMetaTxReceiver {
  uint256 public counter;
  address public contractOwner;
  bool private isDisabled = false;

  mapping(address => bool) private authorized;

  constructor(
    string memory _tokenName,
    string memory _tokenSymbol,
    address _metaTxAddress
  )
    ERC721(_tokenName, _tokenSymbol)
    PablockMetaTxReceiver(_tokenName, "0.0.1", _metaTxAddress)
  {
    counter = 0;

    contractOwner = msgSender();
    authorized[contractOwner] = true;
    authorized[_metaTxAddress] = true;
  }

  modifier isAuthorized() {
    require(authorized[msgSender()], "Not authorized to execute this function");
    _;
  }

  modifier checkIsDisabled() {
    require(!isDisabled, "Smart contract is disabled!");
    _;
  }

  function getAuthStatus(address addr) public view returns (bool) {
    return authorized[addr];
  }

  function mintToken(address _to, string memory _uri)
    public
    isAuthorized
    checkIsDisabled
  {
    _safeMint(_to, counter);
    _setTokenURI(counter, _uri);

    counter++;
  }

  //Be aware! This function will disable minting and transfer of NFT
  function disableSmartContract() public isAuthorized returns (bool) {
    isDisabled = true;
    return isDisabled;
  }

  function transferFrom(
    address from,
    address to,
    uint256 tokenId
  ) public virtual override checkIsDisabled {
    require(
      _isApprovedOrOwner(msgSender(), tokenId),
      "ERC721: transfer caller is not owner nor approved"
    );

    _transfer(from, to, tokenId);
  }
}