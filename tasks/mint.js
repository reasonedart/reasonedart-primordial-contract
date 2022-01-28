task('mint', 'Mints NFT token')
    .addParam('contract', 'Smartcontract instance address to mint on')
    .addParam('receiver', 'EOA address that is going to receive the NFT')
    .addParam('metadata', 'IPFS URI of the NFT metadata')
    .setAction(async args => {
        const ReasonedArtV1 = await ethers.getContractFactory('ReasonedArtV1');
        const reasonedArtV1 = await ReasonedArtV1.attach(args.contract);

        // let gasPrice = await ethers.provider.getGasPrice();
        // let gasLimit = await reasonedArtV1.estimateGas.mintToken(
        //     args.receiver,
        //     args.metadata,
        // );

        // console.log(gasPrice, gasLimit);

        await reasonedArtV1.mintToken(args.receiver, args.metadata, {
            gasLimit: 400000,
            gasPrice: 62500000000,
        });

        // const result = await reasonedArtV1.tokenURI(1);

        // console.log(result);
    });
