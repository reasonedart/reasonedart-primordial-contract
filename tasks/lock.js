task('lock', 'Locks ReasonedArtV1 Smartcontract')
    .addParam('contract', 'Smartcontract instance address to lock')
    .setAction(async args => {
        const ReasonedArtV1 = await ethers.getContractFactory('ReasonedArtV1');
        const reasonedArtV1 = await ReasonedArtV1.attach(args.address);

        const result = await reasonedArtV1.disableSmartContract({ gasLimit: 10000000, gasPrice: 10000000000 });
        console.log('Your contract has been disabled:', result);

        return;
    });

module.exports = {};
