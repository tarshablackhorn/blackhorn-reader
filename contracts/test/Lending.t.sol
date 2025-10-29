// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/BlackhornReader.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract LendingTest is Test, ERC1155Holder {
    BlackhornReader reader;
    address borrower = address(0xB0B);

    function setUp() public {
        reader = new BlackhornReader("ipfs://example/");
    }

    function testLendBlocksOwnerTransfer() public {
        reader.lend(1, borrower, 1 days);

        uint256[] memory ids = new uint256[](1);
        ids[0] = 1;

        uint256[] memory amts = new uint256[](1);
        amts[0] = 1;

        vm.expectRevert(BlackhornReader.LendingActive.selector);
        reader.safeBatchTransferFrom(address(this), address(0xDEAD), ids, amts, "");
    }

    function testBorrowerCanClaimBasicAndBasicIsSoulbound() public {
        reader.lend(1, borrower, 1 days);

        // borrower claims BASIC via review
        vm.prank(borrower);
        reader.reviewAndClaimBasic(1, keccak256("great book"));

        // BASIC cannot transfer
        uint256 basicId = reader.basicBadgeId(1);
        uint256[] memory ids = new uint256[](1);
        ids[0] = basicId;

        uint256[] memory amts = new uint256[](1);
        amts[0] = 1;

        vm.startPrank(borrower);
        vm.expectRevert(BlackhornReader.Soulbound.selector);
        reader.safeBatchTransferFrom(borrower, address(0xDEAD), ids, amts, "");
        vm.stopPrank();
    }

    function testBurnForRareUpgradesAndBurnsBook() public {
        // owner claims BASIC first
        reader.reviewAndClaimBasic(1, keccak256("review"));

        // then upgrades to RARE
        reader.burnForRare(1);

        assertEq(reader.balanceOf(address(this), reader.basicBadgeId(1)), 0);
        assertEq(reader.balanceOf(address(this), reader.rareBadgeId(1)), 1);
        assertEq(reader.balanceOf(address(this), 1), 0); // book burned
    }
}

