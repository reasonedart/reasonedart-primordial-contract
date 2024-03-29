//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./ReasonedArtData.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "pablock-smart-contracts/contracts/PablockMetaTxReceiver.sol";

contract ReasonedArtV1 is
    ERC721URIStorage,
    ERC721Enumerable,
    PablockMetaTxReceiver
{
    uint256 public counter;
    address public contractOwner;
    address private rartDataAddress;
    bool private isDisabled = false;

    mapping(address => bool) private authorized;

    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        address _rartDataAddress
    )
        ERC721(_tokenName, _tokenSymbol)
        PablockMetaTxReceiver(_tokenName, "0.0.1")
    {
        counter = 0;

        contractOwner = msgSender();
        rartDataAddress = _rartDataAddress;
        authorized[contractOwner] = true;
        // authorized[_metaTxAddress] = true;
    }

    modifier onlyOwner() {
        require(msgSender() == contractOwner, "Not allowed");
        _;
    }

    modifier isAuthorized() {
        require(
            authorized[msgSender()],
            "Not authorized to execute this function"
        );
        _;
    }

    modifier checkIsDisabled() {
        require(!isDisabled, "Smart contract is disabled!");
        _;
    }

    function initializeMetaTransaction(address _metaTxAddress)
        public
        onlyOwner
    {
        setMetaTransaction(_metaTxAddress);
    }

    function getAuthStatus(address addr) public view returns (bool) {
        return authorized[addr];
    }

    function mintToken(address _to, string memory _uri)
        public
        isAuthorized
        checkIsDisabled
    {
        counter++;
        _safeMint(_to, counter);
        _setTokenURI(counter, _uri);
    }

    //Be aware! This function will disable minting and transfer of NFT
    function disableSmartContract() public isAuthorized returns (bool) {
        isDisabled = true;

        return isDisabled;
    }

    function getContractStatus() public view returns (bool) {
        return isDisabled;
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        require(
            ReasonedArtData(rartDataAddress).getWhitelistedDestinationStatus(
                to
            ),
            "Destionation is not in whitelist"
        );

        require(
            _isApprovedOrOwner(msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );

        _transfer(from, to, tokenId);
    }

    function changeDataContract(address addr) public isAuthorized {
        rartDataAddress = addr;
    }

    //Functions override
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, amount);
    }

    function _burn(uint256 tokenId)
        internal
        virtual
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
