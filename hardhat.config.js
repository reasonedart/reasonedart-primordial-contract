require('dotenv').config();

require('@nomiclabs/hardhat-etherscan');
require('@nomiclabs/hardhat-waffle');
require('hardhat-gas-reporter');
require('solidity-coverage');

const fs = require('fs');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const isCI = process.env.CI;

let infuraKey = null;
let maticPrivate = null;
let mumbaiPrivate = null;
let goerliPrivate = null;
let ropstenPrivate = null;

if (!isCI) {
    infuraKey = fs.readFileSync('.infurakey.secret').toString().trim();
    maticPrivate = fs.readFileSync('.matic.secret').toString().trim();
    mumbaiPrivate = fs.readFileSync('.mumbai.secret').toString().trim();
    goerliPrivate = fs.readFileSync('.goerli.secret').toString().trim();
    ropstenPrivate = fs.readFileSync('.ropsten.secret').toString().trim();
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: '0.8.9',
    networks: {
        local: {
            url: 'http://127.0.0.1:7545',
        },
        matic: {
            url: `https://polygon-mainnet.infura.io/v3/${infuraKey}`,
            accounts: [maticPrivate],
        },
        mumbai: {
            url: `https://polygon-mumbai.infura.io/v3/${infuraKey}`,
            accounts: [mumbaiPrivate],
        },
        goerli: {
            url: `https://goerli.infura.io/v3/${infuraKey}`,
            accounts: [goerliPrivate],
        },
        ropsten: {
            url: `https://ropsten.infura.io/v3/${infuraKey}`,
            accounts: [ropstenPrivate],
        },
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS !== undefined,
        currency: 'USD',
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
};
