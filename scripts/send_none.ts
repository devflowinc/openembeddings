import { ethers } from "hardhat";

async function main() {
    let accounts = await ethers.getSigners();
    let person = accounts[2];

    let to = "0x0000000000000000000000000000000000000000";

    let b = await ethers.provider.getBalance(to);
    console.log("balance before: ", b.toString());
    await person.sendTransaction({
        to: to,
        value: 100
    });

    b = await ethers.provider.getBalance(to);
    console.log("balance after: ", b.toString());

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
