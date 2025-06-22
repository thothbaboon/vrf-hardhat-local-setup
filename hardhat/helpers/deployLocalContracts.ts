import hre from "hardhat";
import { VRFCoordinatorV2_5Mock } from "../types/VRFCoordinatorV2_5Mock";

/**
 * Deploys all the contracts needed for the unit tests and local development.
 */
export async function deployLocalContracts() {
  const signers = await hre.ethers.getSigners();
  const [deployer, ...availableSigners] = signers;

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy VRF Coordinator

  const vrfCoordinatorFactory = await hre.ethers.getContractFactory(
    "VRFCoordinatorV2_5Mock"
  );
  const vrfCoordinator = (await vrfCoordinatorFactory.deploy(
    1000, // set low fee (more convenient for testing)
    10, // set low gas price (more convenient for testing),
    5200000000000000 // WEI per LINK
  )) as unknown as VRFCoordinatorV2_5Mock;
  await vrfCoordinator.waitForDeployment();
  const vrfCoordinatorAddress = await vrfCoordinator.getAddress();

  console.log("VRFCoordinatorV2Mock deployed to:", vrfCoordinatorAddress);

  // Create a VRF Coordinator subscription

  const subscriptionTx = await vrfCoordinator.createSubscription();
  const subscriptionReceipt = await subscriptionTx.wait();

  if (!subscriptionReceipt) {
    throw new Error("Failed to create subscription");
  }

  if (!(subscriptionReceipt.logs[0] instanceof hre.ethers.EventLog)) {
    throw new Error("Unexpected receipt log type");
  }

  const subscriptionId = subscriptionReceipt.logs[0].args.subId;

  console.log("Subscription ID:", subscriptionId);

  // Fund the subscription

  await vrfCoordinator.fundSubscription(subscriptionId, 1000000000000000);

  // Deploy FlipCoin

  const FlipCoinFactory = await hre.ethers.getContractFactory("FlipCoin");
  const flipCoin = await FlipCoinFactory.deploy(
    subscriptionId,
    "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // arbitrary bytes32 for testing
    vrfCoordinatorAddress
  );
  await flipCoin.waitForDeployment();
  const flipCoinAddress = await flipCoin.getAddress();

  console.log("FlipCoin deployed to:", flipCoinAddress);

  // Add FlipCoin as a consumer to the subscription

  await vrfCoordinator.addConsumer(subscriptionId, flipCoinAddress);

  return {
    flipCoin,
    vrfCoordinator,
    availableSigners, // returns signers as test accounts
  };
}
