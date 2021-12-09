require('@nomiclabs/hardhat-etherscan');
require('@nomiclabs/hardhat-waffle');
require('hardhat-gas-reporter');
require('solidity-coverage');

require('./tasks/accounts');

require('dotenv').config();

const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || 'NO_POLYGON_RPC_URL';
const RART_PRIVATE_KEY = process.env.RART_PRIVATE_KEY || 'NO_PRIV_KEY';

const POLYGON_MUMBAI_RPC_URL = process.env.POLYGON_MUMBAI_RPC_URL || 'NO_POLYGON_MUMBAI_RPC_URL';
const PRIVATE_KEY = process.env.PRIVATE_KEY || 'NO_PRIV_KEY';

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || 'NO_ETHERSCAN_API_KEY';

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    defaultNetwork: 'hardhat',

    networks: {
        local: {
            url: 'http://127.0.0.1:8545/',
        },
        polygon: {
            url: POLYGON_RPC_URL,
            accounts: [RART_PRIVATE_KEY],
        },
        mumbai: {
            url: POLYGON_MUMBAI_RPC_URL,
            accounts: [PRIVATE_KEY],
        },
    },

    gasReporter: {
        enabled: process.env.REPORT_GAS !== undefined,
        currency: 'USD',
    },

    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },

    solidity: '0.8.9',

    paths: {
        sources: './contracts',
        tests: './test',
        cache: './cache',
        artifacts: './artifacts',
    },
};

