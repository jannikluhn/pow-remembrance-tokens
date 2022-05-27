require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");

task("mint", "Mint a token")
  .addParam("account", "minter account")
  .addParam("mixhash", "mixhash value")
  .addParam("nonce", "nonce value")
  .setAction(async (args) => {
    const namedAccounts = await hre.getNamedAccounts();
    const address = namedAccounts[args.account];
    if (!address) {
      throw new Error("Unknown account " + args.account);
    }
    const signer = await ethers.getSigner(address);
    const contract = await ethers.getContract("POWRemembranceToken", signer);

    const tx = await contract.mint(address, [
      args.mixhash,
      parseInt(args.nonce),
    ]);
    console.log("minting... ", tx);
    const receipt = await tx.wait();
    console.log(
      "successfully minted token",
      receipt.events[0].args.tokenId.toString()
    );
  });

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.14",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  paths: {
    sources: "./src",
  },

  namedAccounts: {
    deployer: 0,
  },
};
