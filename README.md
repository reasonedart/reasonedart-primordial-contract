# Reasoned Art contract

This project includes smart contract for v1 and v2 for Reasoned Art platform.

### Installation

To install all the packages execute:

```console
yarn install
```

### Test

To test the contract add hardhat-privateKeys.json with an array of hardhat
private keys. To get hardhat private keys run:

```console
npx hardhat node
```

To execute test run:

```console
npx hardhat test
```

### Deploy smart contract

To deploy smart contract use prod-deploy.js. It'll deploy only ReasonedArtData
and ReasonedArtV1 contract. To correctly deploy the constant PABLOCK_META_TX
needs to be filled with Pablock Meta Transaction cotract address for the choosen
network.

For run the deploy exevcute:

```console
npx hardhat run scripts/prod-deploy.js --network <choosen_network>
```

### Contract interaction with MetaTransaction

To interact with deployed contract using meta transaction a function signature
need to be create and signed with owner address and values send to Pablock API.
It is possible to use PablockSDK to interact with PablockAPI in the easiest way.
