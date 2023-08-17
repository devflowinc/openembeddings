import { ethers } from "hardhat";

async function main() {
    let accounts = await ethers.getSigners();
    let person = accounts[0];

    await person.sendTransaction({
        to: "0x6a48E4240D6b2a823BA311FE123db99587B103e0",
        value: ethers.parseEther("100.0"),
    });

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
