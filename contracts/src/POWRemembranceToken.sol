//SPDX-License-Identifier: Unlicense
pragma solidity =0.8.14;

import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721, ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract POWRemembranceToken is ERC721Enumerable, ERC721URIStorage, Ownable {
    struct POW {
        bytes32 mixHash;
        uint64 nonce;
    }

    mapping(uint256 => POW) public pows;

    constructor() ERC721("POWRemembranceToken", "POW") {}

    function mint(address coinbase, POW memory pow) external returns (uint256) {
        uint256 tokenID = _tokenID(coinbase, pow);
        pows[tokenID] = pow;
        _safeMint(coinbase, tokenID);
        return tokenID;
    }

    function _tokenID(address coinbase, POW memory pow)
        internal
        pure
        returns (uint256)
    {
        return
            uint256(
                keccak256(abi.encodePacked(coinbase, pow.mixHash, pow.nonce))
            );
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
