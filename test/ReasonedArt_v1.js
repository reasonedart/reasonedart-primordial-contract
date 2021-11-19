const { expect, assert } = require("chai");
const { ethers, run, waffle } = require("hardhat");

const { getTransactionData } = require("../common/EIP712_utils");

const TOKEN_URI = "http://gateway.api.pinata/ipfs/";

const privateKeys = require("../hardhat-privateKeys.json");

let reasonedArt = null;
let metaTransaction = null;

describe("Reasoned Art", async function (accounts) {
  it("should deploy contract", async () => {
    await run("compile");

    const [addr0, addr1] = await ethers.getSigners();

    // Deploy PablockToken
    const PablockToken = await ethers.getContractFactory("PablockToken");
    const pablockToken = await PablockToken.deploy(1000000000);
    await pablockToken.deployed();

    // Deploy EIP712MetaTransaction
    const EIP712MetaTransaction = await ethers.getContractFactory(
      "EIP712MetaTransaction",
    );
    metaTransaction = await EIP712MetaTransaction.deploy(
      "MetaTransaction",
      "0.0.1",
      pablockToken.address,
    );
    await metaTransaction.deployed();

    // Deploy ReasonedArt
    const ReasonedArt = await ethers.getContractFactory("ReasonedArt");
    reasonedArt = await ReasonedArt.connect(addr1).deploy(
      "ReasonedArt",
      "RART",
      metaTransaction.address,
    );
    await reasonedArt.deployed();

    // Enable contract
    await pablockToken.requestToken(addr1.address, 10);
    await pablockToken.addContractToWhitelist(metaTransaction.address, 1, 3);
    await pablockToken.addContractToWhitelist(reasonedArt.address, 1, 1);

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
  it("metatx contract should be authorized", async () => {
    const data = await reasonedArt.getAuthStatus(metaTransaction.address);

    expect(data).to.equals(true);
  });
  it("shoul mint token directly", async () => {
    const [addr0, addr1] = await ethers.getSigners();

    const tx = await reasonedArt.mintToken(
      addr1.address,
      `${TOKEN_URI}/directly`,
    );
    await tx.wait();

    const tokenURI = await reasonedArt.tokenURI(0);
    expect(tokenURI).to.equal(`${TOKEN_URI}/directly`);
  });
  it("shoul not mint token directly", async () => {
    const [addr0] = await ethers.getSigners();

    await expect(
      reasonedArt
        .connect(addr0)
        .mintToken(addr0.address, `${TOKEN_URI}/directly`),
    ).to.be.revertedWith("Not authorized to execute this function");
  });
  it("should generate function sig", async () => {
    const [addr0, addr1] = await ethers.getSigners();

    const functionSignature = (
      await reasonedArt.populateTransaction.mintToken(
        addr1.address,
        `${TOKEN_URI}/metatransacted`,
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
    expect(tokenURI).to.equal(`${TOKEN_URI}/metatransacted`);
  });
  it("should transfer with meta transaction", async () => {
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
    expect(tokenURI).to.equal(`${TOKEN_URI}/metatransacted`);
  });
  it("should not transfer with meta transaction", async () => {
    const [addr0, addr1] = await ethers.getSigners();

    const functionSignature = (
      await reasonedArt.populateTransaction.transferFrom(
        addr0.address,
        addr1.address,
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
    ).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
  });
});
