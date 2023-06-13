import { ethers } from "hardhat";

async function main() {
  const contract = await ethers.deployContract("Voting");
  
  const voting = await contract.waitForDeployment();

  console.log(
    `Voting deployed to ${await voting.getAddress()}`
  );

  console.log(voting);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
