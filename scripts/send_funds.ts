import { ethers } from "hardhat";

async function main() {
    let accounts = await ethers.getSigners();
    let person = accounts[0];

    let b = await ethers.provider.getBalance("0x52A1B7a7220C4C96AD612AcE9f214df573124F9C");
    console.log("balance before: ", b.toString());
    await person.sendTransaction({
        to: "0x52A1B7a7220C4C96AD612AcE9f214df573124F9C",
        value: ethers.parseEther("100.0"),
    });

    b = await ethers.provider.getBalance("0x52A1B7a7220C4C96AD612AcE9f214df573124F9C");
    console.log("balance after: ", b.toString());

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
