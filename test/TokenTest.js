const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")
const { deployTokenFixture } = require("./helpers/TokenFixtures")

const tokens = (n) => {
    return ethers.parseUnits(n.toString(), 18)
}

describe("Token", () => {
    it("Has correct Name", async () => {
        const { token } = await loadFixture(deployTokenFixture)
        expect(await token.name()).to.equal("Dapp University")
        
    })
    
    it("has correct Symbol", async () => {
        const { token } = await loadFixture(deployTokenFixture)
        expect(await token.symbol()).to.equal("DAPP")
    })

    it("has correct Decimals", async () => {
        const { token } = await loadFixture(deployTokenFixture)
        expect(await token.decimals()).to.equal(18)
    })

    it("has correct Total Supply", async () => {
        const { token } = await loadFixture(deployTokenFixture)
        expect(await token.totalSupply()).to.equal(tokens(1000000))
    })

})
