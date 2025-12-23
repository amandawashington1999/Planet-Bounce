import { ethers } from "hardhat";

async function main() {
  console.log("Deploying PlanetBounce...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const PlanetBounce = await ethers.getContractFactory("PlanetBounce");
  const contract = await PlanetBounce.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("PlanetBounce deployed to:", address);
  console.log("\nVerify with:");
  console.log(`npx hardhat verify --network sepolia ${address}`);

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

