const {
    keccak256,
    defaultAbiCoder,
    toUtf8Bytes,
    solidityPack,
} = require('ethers/lib/utils');
const { ecsign } = require('ethereumjs-util');

const sign = (digest, privateKey) => {
    return ecsign(Buffer.from(digest.slice(2), 'hex'), privateKey);
};

const PERMIT_TYPEHASH = keccak256(
    toUtf8Bytes(
        'Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)',
    ),
);

// Gets the EIP712 domain separator
function getDomainSeparator(name, version, contractAddress, chainId) {
    return keccak256(
        defaultAbiCoder.encode(
            ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
            [
                keccak256(
                    toUtf8Bytes(
                        'EIP712Domain(string name, string version, uint256 chainId, address verifyingContract)',
                    ),
                ),
                keccak256(toUtf8Bytes(name)),
                keccak256(toUtf8Bytes(version)),
                chainId,
                contractAddress,
            ],
        ),
    );
}

const getTransactionData = async (
    nonce,
    functionSignature,
    wallet,
    contractObj,
) => {
    const digest = keccak256(
        solidityPack(
            ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
            [
                '0x19',
                '0x01',
                getDomainSeparator(
                    contractObj.name,
                    contractObj.version,
                    contractObj.address,
                    contractObj.chainId,
                ),
                keccak256(
                    defaultAbiCoder.encode(
                        ['uint256', 'address', 'bytes32'],
                        [
                            nonce,
                            wallet.publicKey,
                            keccak256(
                                Buffer.from(
                                    functionSignature.replace('0x', ''),
                                    'hex',
                                ),
                            ),
                        ],
                    ),
                ),
            ],
        ),
    );

    const signature = sign(digest, Buffer.from(wallet.privateKey, 'hex'));

    // let r = signature.slice(0, 66);
    // let s = "0x".concat(signature.slice(66, 130));
    // let v = "0x".concat(signature.slice(130, 132));
    // v = web3.utils.hexToNumber(v);
    // if (![27, 28].includes(v)) v += 27;

    return signature;
};

module.exports = {
    sign,
    getTransactionData,
    getDomainSeparator,
};
