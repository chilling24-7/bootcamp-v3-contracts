// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TokenModule", (m) => {
  const TOTAL_SUPPLY = 1000000
  const DEPLOYER = m.getAccount(0)

  const DAPP = m.contract("Token",
     ["Dapp University", "DAPP", TOTAL_SUPPLY], 
     {  from: DEPLOYER, id: "DAPP" }
    )

  const mUSDC = m.contract("Token",
     ["Mock USDC", "mUSDC", TOTAL_SUPPLY], 
     {  from: DEPLOYER, id: "mUSDC" }
    )
    
    const mLINK = m.contract("Token",
     ["Mock LINK", "mLINK", TOTAL_SUPPLY], 
     {  from: DEPLOYER, id: "mLINK" }
    )

  return { DAPP, mUSDC, mLINK };
});
