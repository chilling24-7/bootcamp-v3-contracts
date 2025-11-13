// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import { Token } from "./Token.sol";

contract Exchange {
    //State Variables
    address public feeAccount;
    uint256 public feePercent;

    //Total Tokens belonging to a user
    mapping(address => mapping(address => uint256)) private userTotalTokenBalance;

    //Events
    event tokensDeposited(address token, address user, uint256 amount, uint256 balance);
    event tokensWithdrawn(address token, address user, uint256 amount, uint256 balance);

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    //Deposit and Withdraw Token
    function depositToken(address _token, uint256 _amount) public {

        // Update the Users Balance on the Exchange
        userTotalTokenBalance[_token][msg.sender] += _amount;

        //Emit and Event
        emit tokensDeposited(_token, msg.sender, _amount,  userTotalTokenBalance[_token][msg.sender]);

        // Transfer tokens to exchange
        require(
            Token(_token).transferFrom(msg.sender, address(this), _amount),
            "Exchange: Token transfer failed"
            );
    }

    function withdrawToken(address _token, uint256 _amount) public {
        require(totalBalanceOf(_token, msg.sender) >= _amount, "Exchange: Insufficient Balance");

        // Update User Balance
        userTotalTokenBalance[_token][msg.sender] -= _amount;

        //Emit an Event
        emit tokensWithdrawn(_token, msg.sender, _amount,  userTotalTokenBalance[_token][msg.sender]);

        //Transfer Tokens back to user
        require(Token(_token).transfer(msg.sender, _amount), "Exchange: Token transfer failed");
    }

    function totalBalanceOf(address _token, address _user) public view returns (uint256){
        return userTotalTokenBalance[_token][_user];
    }
}