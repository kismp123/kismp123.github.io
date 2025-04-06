// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {ethereumPrivatekey} from "../src/ethereumPrivatekey.sol";

contract PrivatekeyScript is Script {
    ethereumPrivatekey public privatekey;

    function setUp() public {}

    function run() public {
        uint256 deployer = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployer);
        privatekey = new ethereumPrivatekey();
        vm.stopBroadcast();
    }
}
