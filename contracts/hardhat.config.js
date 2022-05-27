require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");
const { default: Common, Chain, Hardfork } = require("@ethereumjs/common");
const { Block, BlockHeader } = require("@ethereumjs/block");
const { BN } = require("ethereumjs-util");
const { default: Ethash } = require("@ethereumjs/ethash");
const level = require("level-mem");

const cacheDB = level();

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
    const contract = await ethers.getContract("PoWRemembranceToken", signer);

    const tx = await contract.mint(address, [
      ethers.utils.zeroPad(args.mixhash, 32),
      parseInt(args.nonce),
    ]);
    console.log("minting... ", tx);
    const receipt = await tx.wait();
    console.log(
      "successfully minted token",
      receipt.events[0].args.tokenId.toString()
    );
  });

task("mintSome", "Mint some tokens for testing").setAction(async (args) => {
  const { deployer } = await hre.getNamedAccounts();
  const signer = await ethers.getSigner(deployer);
  const contract = await ethers.getContract("PoWRemembranceToken", signer);
  const mixHash =
    "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  let txPromises = [];
  for (let i = 0; i < 5; i++) {
    tx = await contract.mint(deployer, [mixHash, i]);
    txPromises.push(tx.wait());
  }
  await Promise.all(txPromises);
});

task("validate", "").setAction(async (args) => {
  const { deployer } = await hre.getNamedAccounts();
  const signer = await ethers.getSigner(deployer);
  const contract = await ethers.getContract("PoWRemembranceToken", signer);

  const numTokens = await contract.totalSupply();
  for (let i = 0; i < numTokens; i++) {
    const tokenID = await contract.tokenByIndex(i);
    const [owner, pow, validated] = await Promise.all([
      contract.ownerOf(tokenID),
      contract.pows(tokenID),
      contract.validated(tokenID),
    ]);
    if (validated) {
      console.log("token", tokenID, "already validated");
    } else {
      console.log("validating token", tokenID.toString(), "...");
      if (await validatePoW(owner, pow)) {
        console.log("token is valid, marking...");
        const tx = await contract.validate(tokenID);
        await tx.wait();
        console.log("done");
      } else {
        console.log("token", tokenID, "is invalid");
      }
    }
  }
});

async function validatePoW(coinbase, pow) {
  const e = new Ethash(cacheDB);
  // TODO: parent should be last PoW block

  console.log({
    difficulty: new BN(100),
    number: new BN(1),
    coinbase: coinbase,
    nonce: ethers.utils.zeroPad(pow.nonce.toHexString(), 8),
    mixHash: pow.mixHash,
  });
  const block = Block.fromBlockData({
    header: {
      difficulty: new BN(100),
      number: new BN(1),
      coinbase: coinbase,
      nonce: ethers.utils.zeroPad(pow.nonce.toHexString(), 8),
      mixHash: pow.mixHash,
    },
  });
  return await e.verifyPOW(block);
}
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
    miner: 1,
  },
};
