const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")
const { deployExchangeFixture, depositExchangeFixture, orderExchangeFixture } = require("./helpers/ExchangeFixtures")

const tokens = (n) => {
    return ethers.parseUnits(n.toString(), 18)
}

describe("Exchange", () => {
    
    describe("Deployment", () => {

        it("It deploys the Exchange and tracks the Fee ", async () => {
            const { exchange, accounts } = await loadFixture(deployExchangeFixture)
            expect(await exchange.feeAccount()).to.equal(accounts.feeAccount.address)
        })
        it("Tracks the Fee Account ", async () => {
            const { exchange } = await loadFixture(deployExchangeFixture)
            expect(await exchange.feePercent()).to.equal(10)
        })
    }) 

    describe("Depositing Token", () => {
        const AMOUNT = tokens("100")
    
        describe("Success", () => {
            it("Tracks the Token Deposit ", async () => {
            const { tokens: {token0}, exchange, accounts } = await loadFixture(depositExchangeFixture)
            expect(await token0.balanceOf(await exchange.getAddress())).to.equal(AMOUNT)
            expect(await exchange.totalBalanceOf(await token0.getAddress(), accounts.user1.address)).to.equal(AMOUNT)
            })

            it("It Emits a tokensDeposited event ", async () => {
            const { tokens: {token0}, exchange, accounts, transaction } = await loadFixture(depositExchangeFixture)
            await expect(transaction).to.emit(exchange, "tokensDeposited")
                .withArgs(
                await token0.getAddress(),
                accounts.user1.address,
                AMOUNT,
                AMOUNT 
                )
            })
        })

        describe("Failure", () => {

            it("Fails when no tokens approved", async () => {
                const { tokens: { token0 }, exchange, accounts } = await loadFixture(deployExchangeFixture)
                await expect(exchange.connect(accounts.user1).depositToken(await token0.getAddress(), AMOUNT)).to.be.reverted
            })
        })  
    }) 

    describe("Withdrawing Token", () => {
        const AMOUNT = tokens("100")
    
        describe("Success", () => {
            it("Withdraws the Token Deposit ", async () => {
            const { tokens: {token0}, exchange, accounts } = await loadFixture(depositExchangeFixture)

            // Now withdraw tokens
            const transaction = await exchange.connect(accounts.user1).withdrawToken(await token0.getAddress(), AMOUNT)
            await transaction.wait()

            expect(await token0.balanceOf(await exchange.getAddress())).to.equal(0)
            expect(await exchange.totalBalanceOf(await token0.getAddress(), accounts.user1.address)).to.equal(0)
            })

            it("It Emits a TokensWithDrawn event ", async () => {
            const { tokens: {token0}, exchange, accounts } = await loadFixture(depositExchangeFixture)

            const transaction = await exchange.connect(accounts.user1).withdrawToken(await token0.getAddress(), AMOUNT)
            await transaction.wait()

            await expect(transaction).to.emit(exchange, "tokensWithdrawn")
                .withArgs(
                await token0.getAddress(),
                accounts.user1.address,
                AMOUNT,
                0 
                );
            })
        })
        describe("Failure", () => {

            it("Fails for insufficient balance", async () => {
                const { tokens: { token0 }, exchange, accounts } = await loadFixture(deployExchangeFixture)
                const ERROR = "Exchange: Insufficient Balance"

                await expect(exchange.connect(accounts.user1).withdrawToken(await token0.getAddress(), AMOUNT)).to.be.revertedWith(ERROR)
            })
        })  
    })

    describe("Making Orders", () => {
    
        describe("Success", () => {
            it("tracks the newly created Order ", async () => {
            const { exchange } = await loadFixture(orderExchangeFixture)
            expect(await exchange.orderCount()).to.equal(1)
            })

            it("It Emits an OrderCreated event ", async () => {
                const { tokens: {token0, token1}, exchange, accounts, transaction } = await loadFixture(orderExchangeFixture)

                const ORDER_ID = 1
                const AMOUNT = tokens(1)
                const { timestamp } = await ethers.provider.getBlock()

                await expect(transaction).to.emit(exchange, "OrderCreated")
                    .withArgs(
                        ORDER_ID,
                        accounts.user1.address,
                        await token1.getAddress(),
                        AMOUNT,
                        await token0.getAddress(),
                        AMOUNT,
                        timestamp
                    );  
            })
        
        })
        describe("Failure", () => {

            it("Rejects with no Balance", async () => {
                const { tokens: { token0, token1 }, exchange, accounts } = await loadFixture(deployExchangeFixture)
                const ERROR = "Exchange: Insufficient balance"

                await expect(exchange.connect(accounts.user1).makeOrder(
                    await token1.getAddress(), 
                    tokens(1),
                    await token0.getAddress(),
                    tokens(1)
                    )).to.be.revertedWith(ERROR)
            })
        })  

        describe("Canceling Orders", () => {
            describe("Success", () => {
                it("updates cancelled Orders ", async () => {
                const { exchange, accounts } = await loadFixture(orderExchangeFixture)

                const tranaction = await exchange.connect(accounts.user1).cancelOrder(1)
                await tranaction.wait()

                expect(await exchange.isOrderCancelled(1)).to.equal(true)
                })
                it("It Emits an OrderCancelled event ", async () => {
                const { tokens: {token0, token1}, exchange, accounts } = await loadFixture(orderExchangeFixture)

                const transaction = await exchange.connect(accounts.user1).cancelOrder(1)
                await transaction.wait()

                const ORDER_ID = 1
                const AMOUNT = tokens(1)
                const { timestamp } = await ethers.provider.getBlock()

                await expect(transaction).to.emit(exchange, "OrderCancelled")
                    .withArgs(
                        ORDER_ID,
                        accounts.user1.address,
                        await token1.getAddress(),
                        AMOUNT,
                        await token0.getAddress(),
                        AMOUNT,
                        timestamp
                    );  
                })
            })
            describe("Failure", () => {
                it("Rejects with invalid Order ID", async () => {
                    const { exchange, accounts } = await loadFixture(deployExchangeFixture)
                    const ERROR = "Exchange: Order does not exist"

                    await expect(exchange.connect(accounts.user1).cancelOrder(99999)).to.be.revertedWith(ERROR)
                }) 

                it("rejects unauthorized cancelations", async () => {
                    const { exchange, accounts } = await loadFixture(orderExchangeFixture)
                    const ERROR = "Exchange: NOT the Owner" 

                    await expect(exchange.connect(accounts.user2).cancelOrder(1)).to.be.revertedWith(ERROR)
                })
            })
        })
    })
})