// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  // Deploy PablokcToken for executing test
  const PablockToken = await ethers.getContractFactory("PablockToken");
  const pablockToken = await PablockToken.deploy(1000000000, {
    gasLimit: 500000,
    gasPrice: 100000000000,
  });
  await pablockToken.deployed();

  // Deploy EIP712MetaTransaction for executing test
  const MetaTx = await ethers.getContractFactory("EIP712MetaTransaction");
  const metaTx = await MetaTx.deploy(
    "PablockMetaTransaction",
    "0.1.0",
    pablockToken.address,
    {
      gasLimit: 500000,
      gasPrice: 100000000000,
    },
  );
  await pablockToken.deployed();

  const ReasonedArt = await ethers.getContractFactory("ReasonedArt");
  const reasonedArt = await ReasonedArt.deploy(
    "ReasonedArt",
    "RART",
    metaTx.address,
    { gasLimit: 500000, gasPrice: 100000000000 },
  );

  await reasonedArt.deployed();

  await pablockToken.addContractToWhitelist(metaTx.address, 1, 3);
  await pablockToken.addContractToWhitelist(reasonedArt.address, 1, 2);

  console.log("ReasonedArt:", reasonedArt.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
