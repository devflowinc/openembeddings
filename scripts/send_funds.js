import { ethers } from "hardhat";

async function main() {
    let accounts = await ethers.getSigners();
    let person = accounts[0];

    await person.sendTransaction({
        to: "0x9796304106e5B756f179dF27933E701e522F040a",
        value: ethers.parseEther("100.0"),
    });

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
