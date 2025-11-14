// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import { Token } from "./Token.sol";

contract Exchange {
    //State Variables
    address public feeAccount;
    uint256 public feePercent;
    uint256 public orderCount;

    // Mappings
    mapping(uint256 => Order) public orders;

    //Total Tokens belonging to a user
    mapping(address => mapping(address => uint256)) private userTotalTokenBalance;

    //Total tokens on an active order
    mapping(address => mapping(address => uint256)) private userActiveTokenBalance;

    //Events
    event tokensDeposited(address token, address user, uint256 amount, uint256 balance);
    event tokensWithdrawn(address token, address user, uint256 amount, uint256 balance);

    event OrderCreated(
        uint256 id, // Unique identifier for order
        address user, // User who made Order
        address tokenGet, // Address of the token they recieve
        uint256 amountGet, // Amount they recieve
        address tokenGive, // Address of token they give
        uint256 amountGive, // Amount they give 
        uint256 timestamp // When the order was created 
    );

    struct Order {
        //Attributes of an order
        uint256 id; // Unique identifier for order
        address user; // User who made Order
        address tokenGet; // Address of the token they recieve
        uint256 amountGet; // Amount they recieve
        address tokenGive; // Address of token they give
        uint256 amountGive; // Amount they give 
        uint256 timestamp; // When the order was created  
    }

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
        require(totalBalanceOf(_token, msg.sender) - activeBalanceOf(_token, msg.sender)
            >= _amount, "Exchange: Insufficient Balance");

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

    function activeBalanceOf(
        address _token,
        address _user
    ) public view returns (uint256) {
        return userActiveTokenBalance[_token][_user];
    }

    // Make and Cancel Orders
    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
        require(totalBalanceOf(_tokenGive, msg.sender) >= 
            activeBalanceOf(_tokenGive, msg.sender) + _amountGive, "Exchange: Insufficient balance");

        // Update Order Count
        orderCount ++;

        // Update the users active balance
        userActiveTokenBalance[_tokenGive][msg.sender] += _amountGive;

        // Instatiate a new Order
        orders[orderCount] = Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );

        // Emit event
        emit OrderCreated(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
    }
}