import { ethers } from "hardhat";

const abi = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function balanceOf(address account) view returns (uint256)'
];

async function main() {

    let to = "0x412399F82eE44042a4b5F0100D2BED4f5CFF61D2";
    const impersonatedSigner = await ethers.getImpersonatedSigner("0x292008a92060e038dd8C76F18346FA8bE6081717");

    let wbtc = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";

    const WBTC = new ethers.Contract(wbtc, abi, impersonatedSigner);

    let balance = await WBTC.connect(impersonatedSigner).balanceOf(to);
    let etherBalance = await ethers.provider.getBalance(to);
    console.log("balance: ", balance.toString(), "ether: ", etherBalance.toString());

    await WBTC.connect(impersonatedSigner).transfer(to, ethers.parseUnits("1", 8));

    balance = await WBTC.connect(impersonatedSigner).balanceOf(to);
    etherBalance = await ethers.provider.getBalance(to);
    console.log("balance: ", balance.toString(), "ether: ", etherBalance.toString());
    await impersonatedSigner.sendTransaction({
        to: to,
        value: ethers.parseEther("100.0"),
    });

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
