// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/BlackhornReader.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract PurchaseTest is Test, ERC1155Holder {
    BlackhornReader public reader;
    address public owner;
    address public buyer;
    
    uint256 constant BOOK_ID = 1;
    uint256 constant BOOK_PRICE = 0.001 ether;
    
    event BookPurchased(address indexed buyer, uint256 indexed bookId, uint256 price);
    
    function setUp() public {
        owner = address(this);
        buyer = makeAddr("buyer");
        
        reader = new BlackhornReader("ipfs://test");
        
        // Give buyer some ETH
        vm.deal(buyer, 10 ether);
    }
    
    // Allow contract to receive ETH
    receive() external payable {}
    
    function test_DefaultBookPrice() public view {
        uint256 price = reader.bookPrices(BOOK_ID);
        assertEq(price, BOOK_PRICE, "Default book price should be 0.001 ETH");
    }
    
    function test_PurchaseBook() public {
        uint256 initialBalance = owner.balance;
        
        vm.prank(buyer);
        vm.expectEmit(true, true, false, true);
        emit BookPurchased(buyer, BOOK_ID, BOOK_PRICE);
        
        reader.purchaseBook{value: BOOK_PRICE}(BOOK_ID);
        
        // Check buyer received the book
        assertEq(reader.balanceOf(buyer, BOOK_ID), 1, "Buyer should own 1 book");
        
        // Check owner received payment
        assertEq(owner.balance, initialBalance + BOOK_PRICE, "Owner should receive payment");
    }
    
    function test_PurchaseBookWithExcessPayment() public {
        uint256 excessAmount = BOOK_PRICE + 0.5 ether;
        
        vm.prank(buyer);
        reader.purchaseBook{value: excessAmount}(BOOK_ID);
        
        // Should still work, excess goes to owner
        assertEq(reader.balanceOf(buyer, BOOK_ID), 1, "Buyer should own 1 book");
    }
    
    function test_RevertInsufficientPayment() public {
        vm.prank(buyer);
        vm.expectRevert(BlackhornReader.InsufficientPayment.selector);
        reader.purchaseBook{value: BOOK_PRICE - 1}(BOOK_ID);
    }
    
    function test_RevertInvalidPrice() public {
        uint256 nonExistentBookId = 999;
        
        vm.prank(buyer);
        vm.expectRevert(BlackhornReader.InvalidPrice.selector);
        reader.purchaseBook{value: 1 ether}(nonExistentBookId);
    }
    
    function test_SetBookPrice() public {
        uint256 newPrice = 0.005 ether;
        
        reader.setBookPrice(BOOK_ID, newPrice);
        
        assertEq(reader.bookPrices(BOOK_ID), newPrice, "Book price should be updated");
    }
    
    function test_RevertSetBookPriceNotOwner() public {
        vm.prank(buyer);
        vm.expectRevert();
        reader.setBookPrice(BOOK_ID, 0.005 ether);
    }
    
    function test_MultiplePurchases() public {
        address buyer2 = makeAddr("buyer2");
        vm.deal(buyer2, 10 ether);
        
        // First purchase
        vm.prank(buyer);
        reader.purchaseBook{value: BOOK_PRICE}(BOOK_ID);
        
        // Second purchase (should mint another copy)
        vm.prank(buyer2);
        reader.purchaseBook{value: BOOK_PRICE}(BOOK_ID);
        
        assertEq(reader.balanceOf(buyer, BOOK_ID), 1, "Buyer 1 should own 1 book");
        assertEq(reader.balanceOf(buyer2, BOOK_ID), 1, "Buyer 2 should own 1 book");
    }
    
    function test_PurchaseAndLend() public {
        // Purchase book
        vm.prank(buyer);
        reader.purchaseBook{value: BOOK_PRICE}(BOOK_ID);
        
        // Buyer should be able to lend it (requires owner role - this should fail)
        address borrower = makeAddr("borrower");
        
        vm.prank(buyer);
        vm.expectRevert();
        reader.lend(BOOK_ID, borrower, 7 days);
    }
}
