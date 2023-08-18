require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",

  hardhat: {
    forking: {
      url: "https://mainnet.infura.io/v3/d070194319014db69343711b10b943d0",
    }
  }
};
