// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract ethereumPrivatekey {
    address public owner;
    mapping(address => bool) verified;
    mapping(bytes32 => bool) public privateKeyMap;
    mapping(bytes32 => bool) public isAcitvated;

    constructor(){
        owner = msg.sender;
        verified[msg.sender] = true;
    }

    modifier ownerOnly(){
        require(msg.sender == owner, "OWNER ONLY");
        _;
    }

    modifier verifiedOnly{
        require(_isVerified(msg.sender), "VERIFIED ONLY");
        _;
    }

    event privateKey(address _user, bytes32 _privatekey, bool _isUsed);
    function newPrivateKey(address _user, bytes32 _privatekey, bool _isUsed) external verifiedOnly{
        require(_isDuplicatedKey(_privatekey) == false || (_isUsed == true && isAcitvated[_privatekey] == false), "duplicated key");
        _newPrivateKey(_user, _privatekey, _isUsed);
    }

    function newPrivateKeys(address[] memory _users, bytes32[] memory _privatekeys, bool[] memory _isUsed) external verifiedOnly{
        uint256 length = _users.length;
        require(_users.length == _privatekeys.length, "length is incorrect");
        for(uint256 i=0; i<length; i++){
            if( _isDuplicatedKey(_privatekeys[i]) == true ) continue;
            if( isAcitvated[_privatekeys[i]] == true ) continue;
            _newPrivateKey(_users[i], _privatekeys[i], _isUsed[i]); 
        }
    }

    function setVerified(address _verified) external ownerOnly{
        _setVerified(_verified, true);
    }

    function setVerified(address[] memory _verified) external ownerOnly{
        for(uint256 i=0; i<_verified.length; i++){
            if( verified[_verified[i]] == true ) continue;
            _setVerified(_verified[i], true);
        }
    }

    function deleteVerified(address _verified) external ownerOnly{
        _setVerified(_verified, false);
    }

    function deleteVerified(address[] memory _verified) external ownerOnly{
        for(uint256 i=0; i<_verified.length; i++){
            if( verified[_verified[i]] == false ) continue;
            _setVerified(_verified[i], false);
        }
    }

    function _isVerified(address _verified) internal view returns(bool){
        return verified[_verified];
    }

    function _isDuplicatedKey(bytes32 _privatekey) internal view returns(bool){
        return privateKeyMap[_privatekey];
    }

    function _newPrivateKey(address _user, bytes32 _privatekey, bool _isUsed) internal{
        if( _isUsed == true ) isAcitvated[_privatekey] = true;
        privateKeyMap[_privatekey] = true;
        emit privateKey(_user, _privatekey, _isUsed);
    }

    function _setVerified(address _verified, bool _flag) internal{
        verified[_verified] = _flag;
    }
}
