import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.13",
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337
    },
  },
  gasReporter: {
    currency: "EUR",
    gasPrice: 22.46,
  },
  
};

export default config;
