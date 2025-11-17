// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Token} from "./Token.sol";

interface IFlashLoanReceiver {
    function receiveFlashLoan(
        address token, 
        uint256 amount, 
        bytes memory data
    ) external;
}

// We don't want to deploy this contract. We only want
// our Exchange contract to inherit this contract,
// thus we make it abstract
abstract contract FlashLoanProvider {
    event FlashLoan(address token, uint256 amount, uint256 timestamp);

    function flashLoan(
        address _token,
        uint256 _amount,
        bytes memory _data
    ) public {
        // Get current Balance before
        uint256 tokenBalanceBefore = Token(_token).balanceOf(address(this));

        // Require this contract to have sufficient funds to Send
        require(
            tokenBalanceBefore > 0,
            "FlashLoanProvider: Insufficient funds to loan"
        );

        // Send the money to msg.sender
        require(Token(_token).transfer(msg.sender, _amount), 
        "FlashLoanProvider: Transfer Failed");
        
        // Call receiveFlashLoan() on msg.sender
        IFlashLoanReceiver(msg.sender).receiveFlashLoan(_token, _amount, _data);

        // Get current Balance before
        uint256 tokenBalanceAfter = Token(_token).balanceOf(address(this));

        // Require this contract to have received the funds Back
        require(
            tokenBalanceAfter >= tokenBalanceBefore,
            "FlashLoanProvider: Funds not Received"
        );

        // Emit an Event
        emit FlashLoan(_token, _amount, block.timestamp);
    }
}