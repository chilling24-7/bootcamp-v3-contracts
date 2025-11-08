const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")
const { deployTokenFixture } = require("./helpers/TokenFixtures")

const tokens = (n) => {
    return ethers.parseUnits(n.toString(), 18)
}

describe("Token", () => {
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
