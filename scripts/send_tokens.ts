import { ethers } from "hardhat";

const abi = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function balanceOf(address account) view returns (uint256)'
];

async function main() {

    let to = "0x52A1B7a7220C4C96AD612AcE9f214df573124F9C";
    const impersonatedSigner = await ethers.getImpersonatedSigner("0x28C6c06298d514Db089934071355E5743bf21d60");

    const usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

    // let usdt = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
    // let dai = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";
    // let wbtc = "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6";

    const USDC = new ethers.Contract(usdc, abi, impersonatedSigner);

    let balance = await USDC.connect(impersonatedSigner).balanceOf(impersonatedSigner.address);
    console.log("balance: ", balance.toString());

    await USDC.connect(impersonatedSigner).transfer(to, 100);

    balance = await USDC.connect(impersonatedSigner).balanceOf(impersonatedSigner.address);
    console.log("balance: ", balance.toString());
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
