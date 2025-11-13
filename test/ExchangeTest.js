const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")
const { deployExchangeFixture, depositExchangeFixture } = require("./helpers/ExchangeFixtures")

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

})