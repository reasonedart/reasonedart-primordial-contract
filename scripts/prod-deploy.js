// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

const { ethers } = require('hardhat');

const PABLOCK_META_TX = ''; // Fill with Pablock Meta transaction cotnract address for selected network

async function main() {
    const [deployer] = await ethers.getSigners();

    // Deploy ReasonedArtData
    const ReasonedArtData = await ethers.getContractFactory('ReasonedArtData');
    const reasonedArtData = await ReasonedArtData.deploy(
        'ReasonedArtData',
        '0.1.0',
        deployer.address,
        {
            gasLimit: 10000000,
            gasPrice: 10000000000,
        },
    );
    await reasonedArtData.deployed();

    const ReasonedArt = await ethers.getContractFactory('ReasonedArtV1');
    const reasonedArt = await ReasonedArt.deploy(
        'ReasonedArt',
        'RART',
        reasonedArtData.address,
        { gasLimit: 10000000, gasPrice: 10000000000 },
    );

    await reasonedArt.deployed();

    // await reasonedArtData.initializeMetaTransaction(PABLOCK_META_TX);
    // await reasonedArt.initializeMetaTransaction(PABLOCK_META_TX);

    await reasonedArtData.setWhitelistedDestination(reasonedArt.address);

    console.log('ReasonedArt:', reasonedArt.address);
    console.log("ReasonedArtData:", reasonedArtData.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
