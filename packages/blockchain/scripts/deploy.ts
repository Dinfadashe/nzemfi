import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying NZMToken with account:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

  // Treasury = deployer initially; update to multisig after deployment
  const treasury = deployer.address;

  const NZMToken = await ethers.getContractFactory("NZMToken");
  const nzm = await NZMToken.deploy(treasury);
  await nzm.waitForDeployment();

  const address = await nzm.getAddress();
  console.log("NZMToken deployed to:", address);
  console.log("Treasury:", treasury);
  console.log("Current free rate:", ethers.formatEther(await nzm.currentFreeRate()), "NZM");
  console.log("Current premium rate:", ethers.formatEther(await nzm.currentPremiumRate()), "NZM");

  // Grant minter role to backend wallet
  if (process.env.BACKEND_MINTER_ADDRESS) {
    await nzm.grantMinterRole(process.env.BACKEND_MINTER_ADDRESS);
    console.log("Minter role granted to:", process.env.BACKEND_MINTER_ADDRESS);
  }

  console.log("\n--- COPY THESE TO .env ---");
  console.log(`NEXT_PUBLIC_NZM_CONTRACT_ADDRESS=${address}`);
  console.log(`EXPO_PUBLIC_NZM_CONTRACT_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
