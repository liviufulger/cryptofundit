require("@matterlabs/hardhat-zksync-solc");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  zksolc: {
    version: "1.3.9",
    compilerSource: "binary",
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  networks: {
    zksync_testnet: {
      url: "https://zksync2-testnet.zksync.dev",
      ethNetwork: "goerli",
      chainId: 280,
      zksync: true,
    },
    zksync_mainnet: {
      url: "https://zksync2-mainnet.zksync.io/",
      ethNetwork: "mainnet",
      chainId: 324,
      zksync: true,
    },
  },
  paths: {
    artifacts: "./artifacts-zk",
    cache: "./cache-zk",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.19",
    networks: {
      hardhat: {
      },
      bnbTestnet: {
        url: "https://bsc-testnet-rpc.publicnode.com", 
        chainId: 97,
        accounts: [process.env.PRIVATE_KEY], 
      },
      avaxFuji: {
        url: "https://api.avax-test.network/ext/bc/C/rpc", 
        chainId: 43113, 
        accounts: [process.env.PRIVATE_KEY], 
      },
      hederaFaucet: {
        url: "https://testnet.hashio.io/api", 
        chainId: 296, 
        accounts: [process.env.PRIVATE_KEY], 
      },
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
