// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;
//pragma solidity ^0.8.28;

contract Token {
    // Code goes here
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;

    event Transfer(address indexed _from, address indexed _to, uint _value);
    // event Transfer(address indexed _to, address indexed _from, uint _value);
    

    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer (address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Token: Insufficient Funds");
        require(_to != address(0), "Token:Recipient is address 0");
        
        // Deduct tokens from sender
        balanceOf[msg.sender] -= _value; 

        // Credit tokens to recipient
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);

        return true;
    }
}