// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BlackhornReader is ERC1155, Ownable {
    uint256 public constant BOOK = 1;

    constructor(string memory uri) ERC1155(uri) Ownable(msg.sender) {
        _mint(msg.sender, BOOK, 1, "");
    }
}
