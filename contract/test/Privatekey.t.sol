// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {ethereumPrivatekey} from "src/ethereumPrivatekey.sol";

interface ICrossDomainMessenger{
    function xDomainMessageSender() external view returns(address);
}
contract PrivatekeyTest is Test {
    ethereumPrivatekey public privatekey;

    function setUp() public {
        privatekey = new ethereumPrivatekey();
    }

    function test_newPrivateKey() public{
        privatekey.newPrivateKey(msg.sender, bytes32("41414141"), true);
    }

    function test_duplicated_newPrivateKey() public{
        privatekey.newPrivateKey(msg.sender, bytes32("41414141"), true);
        vm.expectRevert("duplicated key");
        privatekey.newPrivateKey(msg.sender, bytes32("41414141"), false);
    }
    function test_duplicated_activated_newPrivateKey() public{
        privatekey.newPrivateKey(msg.sender, bytes32("41414141"), false);
        privatekey.newPrivateKey(msg.sender, bytes32("41414141"), true);
        vm.expectRevert("duplicated key");
        privatekey.newPrivateKey(msg.sender, bytes32("41414141"), true);
    }

    function test_newPrivateKeys() public{
        address[] memory users = new address[](1);
        bytes32[] memory keys = new bytes32[](1);
        bool[] memory initialized = new bool[](1);
        users[0] = msg.sender;
        keys[0] = bytes32("41414141");

        privatekey.newPrivateKeys(users, keys, initialized);
    }

    function test_setVerified() public{
        privatekey.setVerified(msg.sender);
    }

    // function test_setVerifiedBridge() public{
    //     address bridge = address(privatekey);
    //     bytes4 selector = privatekey.owner.selector;

    //     privatekey.setVerifiedBridge(bridge, selector);
    //     vm.startPrank(bridge);
    //     privatekey.newPrivateKey(msg.sender, bytes32("41414141"));
    // }
}
