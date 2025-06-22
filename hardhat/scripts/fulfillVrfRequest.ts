import hre from "hardhat";
import abi from "@chainlink/contracts/abi/v0.8/VRFCoordinatorV2_5Mock.json";
import { VRFCoordinatorV2_5Mock } from "../types/VRFCoordinatorV2_5Mock";

async function main() {
  const requestId = process.env.REQUEST_ID;
  const number = parseInt(process.env.NUMBER || "1");

  if (!requestId) {
    console.error(
      "Usage: NUMBER=<number> REQUEST_ID=<requestId> npx hardhat run scripts/fulfillVrfRequest.ts --network localhost"
    );
    console.error(
      "Example: NUMBER=5 REQUEST_ID=1 npx hardhat run scripts/fulfillVrfRequest.ts --network localhost"
    );
    process.exit(1);
  }

  const signers = await hre.ethers.getSigners();
  const [deployer] = signers;

  const provider = new hre.ethers.JsonRpcProvider("http://127.0.0.1:8545");

  const vrfCoordinatorAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const flipCoinAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

  const vrfCoordinatorV2Mock = new hre.ethers.Contract(
    vrfCoordinatorAddress,
    abi,
    provider
  );
  const vrfCoordinatorV2MockWithSigner = vrfCoordinatorV2Mock.connect(
    deployer
  ) as VRFCoordinatorV2_5Mock;

  console.log(
    `Triggering VRF fulfillment for requestId: ${requestId} with number ${number}`
  );

  let fulfillRandomWordsTx =
    await vrfCoordinatorV2MockWithSigner.fulfillRandomWordsWithOverride(
      BigInt(requestId),
      flipCoinAddress,
      [number]
    );
  let fulfillRandomWordsReceipt = await fulfillRandomWordsTx.wait();

  if (!fulfillRandomWordsReceipt) {
    throw new Error("Failed to fulfill VRF request");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
