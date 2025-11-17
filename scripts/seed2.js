const hre = require("hardhat")

const tokens = (n) => {
    return ethers.parseUnits(n.toString(), 18)
}

async function main() {
    console.log("running seed script...")

    const DAPP_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    const mUSDC_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
    const mLINK_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
    const EXCHANGE_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
    const FLASH_LOAN_USER_ADDRESS = "0x663F3ad617193148711d28f5334eE4Ed07016602"

    const dapp = await hre.ethers.getContractAt("Token", DAPP_ADDRESS)
    console.log(`Token fetched: ${await dapp.getAddress()}`)

    // Distribute tokens

    // Deposit funds into exchange

    // Cancel some orders

    // Fill some orders

    // Make some Open Orders

    // Perform some flash loans

}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})