const { default: Common, Chain, Hardfork } = require("@ethereumjs/common");
const { Block, BlockHeader } = require("@ethereumjs/block");
const { BN } = require("ethereumjs-util");
const { default: Ethash } = require("@ethereumjs/ethash");
const level = require("level-mem");

// const coinbase = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const coinbase = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
const cacheDB = level();
const e = new Ethash(cacheDB);
const block = Block.fromBlockData({
  header: {
    difficulty: new BN(100),
    number: new BN(1),
    coinbase: coinbase,
  },
});
const miner = e.getMiner(block.header);

async function mine() {
  miner.currentNonce.iaddn(100);
  console.log("starting at", miner.currentNonce.toString());
  const solution = await miner.iterate(-1);
  const validBlock = Block.fromBlockData({
    header: {
      difficulty: block.header.difficulty,
      number: block.header.number,
      coinbase: coinbase,
      nonce: solution.nonce,
      mixHash: solution.mixHash,
    },
  });
  console.log("nonce post:", miner.currentNonce.toString());
  console.log("");
  const valid = await e.verifyPOW(validBlock);
  if (valid) {
    console.log("found valid solution");
    console.log("coinbase:", coinbase);
    console.log("nonce:", solution.nonce.toString("hex"));
    console.log("mixHash:", solution.mixHash.toString("hex"));
  }
}

async function mineMany() {
  for (let i = 0; i < 10; i++) {
    await mine();
  }
}

mineMany();
