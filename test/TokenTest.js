const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")
const { deployTokenFixture } = require("./helpers/TokenFixtures")

const tokens = (n) => {
    return ethers.parseUnits(n.toString(), 18)
}

describe("Token", () => {
    
    describe("Deployment", () => {

        const NAME = "Dapp University"
    const SYMBOL = "DAPP"
    const DECIMALS = 18
    const TOTAL_SUPPLY = (tokens(1000000))

    it("Has correct Name", async () => {
        const { token } = await loadFixture(deployTokenFixture)
        expect(await token.name()).to.equal(NAME)
        
    })
    
    it("has correct Symbol", async () => {
        const { token } = await loadFixture(deployTokenFixture)
        expect(await token.symbol()).to.equal(SYMBOL)
    })

    it("has correct Decimals", async () => {
        const { token } = await loadFixture(deployTokenFixture)
        expect(await token.decimals()).to.equal(DECIMALS)
    })

    it("has correct Total Supply", async () => {
        const { token } = await loadFixture(deployTokenFixture)
        expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY)
    })

    it("Assigns total Supply to Deployer", async () => {
        const { token, deployer } = await loadFixture(deployTokenFixture)       
        expect(await token.balanceOf(deployer.address)).to.equal(TOTAL_SUPPLY)
    })

    })
     
    describe("Sending Tokens", () =>{
        const AMOUNT = tokens(100)
        
        describe("Success", () => {
            it("transfers a token balance", async () => {
           const { token, deployer, receiver } = await loadFixture(deployTokenFixture) 

           const transaction = await token.connect(deployer).transfer(receiver.address, AMOUNT)
           await transaction.wait()

           expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
           expect(await token.balanceOf(receiver.address)).to.equal(AMOUNT)
            })

        it("emits a transfer event", async () => {
           const { token, deployer, receiver } = await loadFixture(deployTokenFixture) 

           //Before transfer
            const transaction = await token.connect(deployer).transfer(receiver.address, AMOUNT)
            await transaction.wait()
            
            await expect(transaction).to.emit(token, "Transfer")
            .withArgs(deployer.address, receiver.address, AMOUNT)
            })
        })

        describe("Failure", () => {
            it("It rejects insufficient balance", async () => {
           const { token, deployer, receiver } = await loadFixture(deployTokenFixture) 

           const INVALID_AMOUNT = tokens(1000000000)
           const ERROR = "Token: Insufficient Funds"

           await expect(token.connect(deployer).transfer(receiver.address, INVALID_AMOUNT))
           .to.be.revertedWith(ERROR)
            })
        
        it("Rejects invalid recipient", async () => {
           const { token, deployer, receiver } = await loadFixture(deployTokenFixture) 

           const INVALID_ADDRESS = "0x0000000000000000000000000000000000000000"
           const ERROR = "Token: Recipient is address 0"

           await expect(token.connect(deployer).transfer(INVALID_ADDRESS, AMOUNT))
           .to.be.revertedWith(ERROR)

            })
        })
    })

    describe("Approving Tokens", () => {
        const AMOUNT = tokens(100)
        
        describe("Success", async () => {

           it("Allocates an allowance for delegated token spending", async () => {
                const { token, deployer, exchange } = await loadFixture(deployTokenFixture) 

                const transaction = await token.connect(deployer).approve(exchange.address, AMOUNT)
                await transaction.wait()

                expect(await token.allowance(deployer.address, exchange.address)).to.equal(AMOUNT)
           })
           
           it("emits an Approval event", async () => {
            const { token, deployer, exchange } = await loadFixture(deployTokenFixture) 

            const transaction = await token.connect(deployer).approve(exchange.address, AMOUNT)
            await transaction.wait()
            
            await expect(transaction).to.emit(token, "Approval")
            .withArgs(deployer.address, exchange.address, AMOUNT)
            })
        })

        describe("Failure", () => {

          it("Rejects invalid Spenders", async () => {
          const { token, deployer } = await loadFixture(deployTokenFixture) 

          const INVALID_ADDRESS = "0x0000000000000000000000000000000000000000"
          const ERROR = "Token: Recipient is address 0"

          await expect(token.connect(deployer).approve(INVALID_ADDRESS, AMOUNT))
          .to.be.revertedWith(ERROR)
          })
        })
    })
})
