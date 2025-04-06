// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {ethereumPrivatekey} from "../src/ethereumPrivatekey.sol";

contract PrivatekeyScript is Script {
    ethereumPrivatekey public privatekey;

    function setUp() public {}

    function run() public {
        uint256 deployer = vm.envUint("PRIVATE_KEY");
        privatekey = ethereumPrivatekey(vm.envAddress("CONTRACT"));
        vm.startBroadcast(deployer);
        privatekey.setVerified(address(0x25DC0ED8C2b93FBD97CedF0BBFCCf767ed4f69fe));
        vm.stopBroadcast();
    }
}
