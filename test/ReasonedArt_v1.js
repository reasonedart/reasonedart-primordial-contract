const { expect, assert } = require("chai");
const { ethers, run, waffle } = require("hardhat");

const { getTransactionData } = require("../common/EIP712_utils");

const TOKEN_URI = "http://gateway.api.pinata/ipfs";

const privateKeys = require("../hardhat-privateKeys.json");

let reasonedArt = null;
let metaTransaction = null;
let reasonedArtData = null;

describe("Reasoned Art", async function (accounts) {
  it("should deploy contract", async () => {
    await run("compile");

    const [addr0, addr1] = await ethers.getSigners();

    /**
     * Deploy EIP712MetaTransaction
     * Used only on test env, simulate Pablock meta transaction
     */
    const EIP712MetaTransaction = await ethers.getContractFactory(
      "EIP712MetaTransaction",
    );
    metaTransaction = await EIP712MetaTransaction.deploy(
      "MetaTransaction",
      "0.0.1",
    );
    await metaTransaction.deployed();

    /**
     * Deploy PablockToken
     * Used only on test env, simulate Pablock smart contracts
     */
    const PablockToken = await ethers.getContractFactory("PablockToken");
    const pablockToken = await PablockToken.deploy(
      1000000000,
      metaTransaction.address,
    );
    await pablockToken.deployed();

    await metaTransaction.initialize(pablockToken.address);

    // Deploy ReasonedArt
    const ReasonedArtData = await ethers.getContractFactory("ReasonedArtData");
    reasonedArtData = await ReasonedArtData.connect(addr1).deploy(
      "ReasonedArtData",
      "0.1.0",
      addr1.address,
    );
    await reasonedArtData.deployed();

    // Deploy ReasonedArt
    const ReasonedArt = await ethers.getContractFactory("ReasonedArtV1");
    reasonedArt = await ReasonedArt.connect(addr1).deploy(
      "ReasonedArt",
      "RART",
      reasonedArtData.address,
    );
    await reasonedArt.deployed();

    await reasonedArtData.initializeMetaTransaction(metaTransaction.address);
    await reasonedArt.initializeMetaTransaction(metaTransaction.address);

    /**
     * Enable contract on PablockToken contract
     * In mainnet this procedure it will be done by BCode
     */
    await pablockToken.requestToken(addr1.address, 10);
    await pablockToken.addContractToWhitelist(metaTransaction.address, 1, 3);
    await pablockToken.addContractToWhitelist(reasonedArt.address, 1, 1);

    await reasonedArtData
      .connect(addr1)
      .setWhitelistedDestination(reasonedArt.address);

    // console.log("META TX ==>", metaTransaction.address);
    // console.log("CONTRACT ==>", reasonedArt.address);

    expect(reasonedArt).to.not.equal(null);
    expect(metaTransaction).to.not.equal(null);
  });
  it("owner should be authorized", async () => {
    const [addr0, addr1] = await ethers.getSigners();

    const data = await reasonedArt.getAuthStatus(addr1.address);

    expect(data).to.equals(true);
  });
  it("contract should be whitelisted", async () => {
    const data = await reasonedArtData.getWhitelistedDestinationStatus(
      reasonedArt.address,
    );

    expect(data).to.equals(true);
  });
  // it("metatx contract should be authorized", async () => {
  //   const data = await reasonedArt.getAuthStatus(metaTransaction.address);

  //   expect(data).to.equals(true);
  // });
  it("should mint token directly", async () => {
    const [addr0, addr1] = await ethers.getSigners();

    const tx = await reasonedArt.mintToken(addr1.address, `${TOKEN_URI}/0`);
    await tx.wait();

    const tokenURI = await reasonedArt.tokenURI(1);
    expect(tokenURI).to.equal(`${TOKEN_URI}/0`);
  });
  it("should not mint token directly", async () => {
    const [addr0] = await ethers.getSigners();

    await expect(
      reasonedArt.connect(addr0).mintToken(addr0.address, `${TOKEN_URI}/0`),
    ).to.be.revertedWith("Not authorized to execute this function");
  });
  it("should mint with metatransaction", async () => {
    const [addr0, addr1] = await ethers.getSigners();

    // Generating function signature for function mintToken of Reasoned Art contract
    const functionSignature = (
      await reasonedArt.populateTransaction.mintToken(
        addr1.address,
        `${TOKEN_URI}/1`,
      )
    ).data;

    const nonce = await metaTransaction.getNonce(addr1.address);

    /**
     * Sign function call with user private key
     * Note: chainId value change on every network, 31337 is reffered to hardhat network.
     */
    const { r, s, v } = await getTransactionData(
      nonce,
      functionSignature,
      { publicKey: addr1.address, privateKey: privateKeys[1] },
      {
        address: reasonedArt.address,
        name: "ReasonedArt",
        version: "0.0.1",
        chainId: 31337,
      },
    );

    const tx = await metaTransaction
      .connect(addr0)
      .executeMetaTransaction(
        reasonedArt.address,
        addr1.address,
        functionSignature,
        r,
        s,
        v,
        { gasLimit: 1000000, gasPrice: 5000000000 },
      );

    await tx.wait();

    const tokenURI = await reasonedArt.tokenURI(2);
    expect(tokenURI).to.equal(`${TOKEN_URI}/1`);
  });
  it("should transfer with meta transaction", async () => {
    const [addr0, addr1] = await ethers.getSigners();

    const functionSignature = (
      await reasonedArt.populateTransaction.transferFrom(
        addr1.address,
        reasonedArt.address,
        1,
      )
    ).data;

    const nonce = await metaTransaction.getNonce(addr1.address);

    const { r, s, v } = await getTransactionData(
      nonce,
      functionSignature,
      { publicKey: addr1.address, privateKey: privateKeys[1] },
      {
        address: reasonedArt.address,
        name: "ReasonedArt",
        version: "0.0.1",
        chainId: 31337,
      },
    );

    const tx = await metaTransaction
      .connect(addr0)
      .executeMetaTransaction(
        reasonedArt.address,
        addr1.address,
        functionSignature,
        r,
        s,
        v,
        { gasLimit: 1000000, gasPrice: 5000000000 },
      );

    await tx.wait();

    const tokenURI = await reasonedArt.tokenURI(1);
    expect(tokenURI).to.equal(`${TOKEN_URI}/0`);
  });
  it("should not transfer with meta transaction", async () => {
    const [addr0, addr1] = await ethers.getSigners();

    const functionSignature = (
      await reasonedArt.populateTransaction.transferFrom(
        addr1.address,
        addr0.address,
        1,
      )
    ).data;

    const nonce = await metaTransaction.getNonce(addr1.address);

    const { r, s, v } = await getTransactionData(
      nonce,
      functionSignature,
      { publicKey: addr1.address, privateKey: privateKeys[1] },
      {
        address: reasonedArt.address,
        name: "ReasonedArt",
        version: "0.0.1",
        chainId: 31337,
      },
    );

    await expect(
      metaTransaction
        .connect(addr0)
        .executeMetaTransaction(
          reasonedArt.address,
          addr1.address,
          functionSignature,
          r,
          s,
          v,
          { gasLimit: 1000000, gasPrice: 5000000000 },
        ),
    ).to.be.revertedWith("Destionation is not in whitelist");
  });
  it("should disable smart contract", async () => {
    await reasonedArt.disableSmartContract();

    expect(await reasonedArt.getContractStatus()).to.equal(true);
  });
  it("shoul not mint token because contract is disabled", async () => {
    const [addr0, addr1] = await ethers.getSigners();

    await expect(
      reasonedArt.connect(addr1).mintToken(addr0.address, `${TOKEN_URI}/0`),
    ).to.be.revertedWith("Smart contract is disabled!");
  });
});
