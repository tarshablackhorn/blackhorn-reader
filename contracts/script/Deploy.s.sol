// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/BlackhornReader.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Use the BOOK_URI from your .env
        string memory bookURI = vm.envString("BOOK_URI");

        // Deploy the main contract
        BlackhornReader reader = new BlackhornReader(bookURI);

        vm.stopBroadcast();

        console.log(unicode"✅ BlackhornReader deployed to:", address(reader));
    }
}

