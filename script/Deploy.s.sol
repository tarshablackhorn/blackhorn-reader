// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/BlackhornReader.sol";

contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        string memory uri = vm.envString("BOOK_URI");

        vm.startBroadcast(pk);
        BlackhornReader reader = new BlackhornReader(uri);
        vm.stopBroadcast();

        console2.log("✅ BlackhornReader deployed at:", address(reader));
        console2.log("📘 Metadata URI:", uri);
    }
}

