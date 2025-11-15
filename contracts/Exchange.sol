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
    mapping(uint256 => bool) public isOrderCancelled;
    mapping(uint256 => bool) public isOrderFilled;

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

    event OrderCancelled(
        uint256 id, // Unique identifier for order
        address user, // User who made Order
        address tokenGet, // Address of the token they recieve
        uint256 amountGet, // Amount they recieve
        address tokenGive, // Address of token they give
        uint256 amountGive, // Amount they give 
        uint256 timestamp // When the order was created 
    );

    event OrderFilled(
        uint256 id, // Unique identifier for order
        address user, // User who made Order
        address tokenGet, // Address of the token they recieve
        uint256 amountGet, // Amount they recieve
        address tokenGive, // Address of token they give
        uint256 amountGive, // Amount they give 
        address creator,
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
    function cancelOrder(uint256 _id) public {
        // Fetch the order
        Order storage order = orders[_id];

        // Order must exist
        require(order.id == _id, "Exchange: Order does not exist");

        // Ensure the caller of the function is the owner of the order
        require(address(order.user) == msg.sender, "Exchange: NOT the Owner");

        // Cancel the order
        isOrderCancelled[_id] = true;

        // Update the Active Balance
        userActiveTokenBalance[order.tokenGive][order.user] -= order.amountGive;

        // Emit the event
        emit OrderCancelled(
            order.id,
            msg.sender,
            order.tokenGet,
            order.amountGet,
            order.tokenGive,
            order.amountGive,
            block.timestamp
        );
    }

    // Executing Orders

    function fillOrder(uint256 _id) public {
        // Verify if the order is Valid
        require(_id > 0 && _id <= orderCount, "Exchange: Order does not Exist");

        // Verify that the Order cannot be filled
        require(!isOrderFilled[_id], "Exchange: Order has already been filled");

        // Order cannot be cancelled
        require(!isOrderCancelled[_id], "Exchange: Order has been canceled");

        // Fetch the Order
        Order storage order = orders[_id];

        // Prevent filling if msg.sender already has thier tokens listed
        require(
            totalBalanceOf(order.tokenGet, msg.sender) >=
                activeBalanceOf(order.tokenGet, msg.sender) + order.amountGet,
            "Exchange: Insufficient balance"
        );

        // Execute the trade
        _trade(
            order.id,
            order.user,
            order.tokenGet,
            order.amountGet,
            order.tokenGive,
            order.amountGive
        );

        // Mark Order as Filled
        isOrderFilled[order.id] = true;
    }

    function _trade(
        uint256 _orderId,
        address _user,
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) internal {
        // Fee from Trade, paid by the user who filled the order
        uint256 _feeAmount = (_amountGet * feePercent) / 100;

        //Let User who created the order get thier tokens
         userTotalTokenBalance[_tokenGet][msg.sender] -= (_amountGet + _feeAmount);
         userTotalTokenBalance[_tokenGet][_user] += _amountGet;

        // Charge fees
        userTotalTokenBalance[_tokenGet][feeAccount] += _feeAmount;

         // Give the requested token to msg.sender, and minuse token balance from the user
         userTotalTokenBalance[_tokenGive][_user] -= _amountGive;
         userTotalTokenBalance[_tokenGive][msg.sender] += _amountGive;

        // Updates users active token balance
        userActiveTokenBalance[_tokenGive][_user] -= _amountGive;

        // Emit event
        emit OrderFilled(
            _orderId,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            _user,
            block.timestamp
        );
    }
}