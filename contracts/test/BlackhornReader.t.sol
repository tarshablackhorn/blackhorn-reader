// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/BlackhornReader.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract BlackhornReaderTest is Test, ERC1155Holder {
    BlackhornReader reader;

    function setUp() public {
        reader = new BlackhornReader("ipfs://example-metadata/");
    }

    function testOwnerMintedToThisContract() public {
        assertEq(reader.balanceOf(address(this), 1), 1);
    }
}
                            
      

