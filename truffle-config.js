const HDWalletProvider = require('truffle-hdwallet-provider');
const { mnemonic, BSCSCANAPIKEY} = require('./secrets.json');


module.exports = {
  api_keys: {
    bscscan: BSCSCANAPIKEY
  },
  networks: {
   development: {
     host: "127.0.0.1",
     port: 7545,
     network_id: "*"
   },
   test: {
     host: "127.0.0.1",
     port: 8545,
     network_id: "*"
    },
   testnet: {
     provider: function () {
       return new HDWalletProvider(mnemonic, `https://data-seed-prebsc-1-s2.binance.org:8545/`)
     },
      network_id: 97,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    bsc: {
      provider: () => new HDWalletProvider(mnemonic, `https://bsc-dataseed1.binance.org`),
      network_id: 56,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    },
  },
   compilers: {
    solc: {
      version: "0.5.16",
      settings: {          
       optimizer: {
         enabled: true,
         runs: 200
        },
        evmVersion: "istanbul"
      }
    }
   },
};
