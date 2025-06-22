import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { deployLocalContracts } from "../helpers/deployLocalContracts";

describe("FlipCoin", function () {
  async function flipCoinFixture() {
    const { flipCoin, vrfCoordinator, availableSigners } =
      await deployLocalContracts();
    // Using another addresse than the deployer to make the tests
    return { flipCoin, vrfCoordinator, player: availableSigners[1] };
  }

  async function flip(number: number) {
    const { flipCoin, player, vrfCoordinator } =
      await loadFixture(flipCoinFixture);

    const flipCoinWithPlayer = flipCoin.connect(player);

    const flipTx = await flipCoinWithPlayer.flip();
    const flipReceipt = await flipTx.wait();

    if (!flipReceipt) {
      throw new Error("Flip transaction failed");
    }

    // Get the requestId from the RandomWordsRequested event
    const flippingEvent = vrfCoordinator.interface.parseLog(
      flipReceipt.logs[0]
    );

    if (!flippingEvent) {
      throw new Error("Request event not found");
    }

    const { requestId } = flippingEvent.args;

    // fulfill the VRF request
    let fulfillRandomWordsTx =
      await vrfCoordinator.fulfillRandomWordsWithOverride(
        requestId,
        await flipCoin.getAddress(),
        [number]
      );
    let fulfillRandomWordsReceipt = await fulfillRandomWordsTx.wait();

    if (!fulfillRandomWordsReceipt) {
      throw new Error("Fulfill random words transaction failed");
    }

    const flippedEvent = flipCoin.interface.parseLog(
      fulfillRandomWordsReceipt.logs[0]
    );

    if (!flippedEvent) {
      throw new Error("Flipped event not found");
    }

    return { flippedEvent, player };
  }

  describe("When a user flips a coin", function () {
    describe("And the random number is even", function () {
      it("Should emit a Flipped event with Heads", async function () {
        const { flippedEvent, player } = await flip(2);

        expect(flippedEvent.name).to.equal("Flipped");
        expect(flippedEvent.args.player).to.equal(player.address);
        expect(flippedEvent.args.result).to.equal("Heads");
      });
    });

    describe("And the random number is odd", function () {
      it("Should emit a Flipped event with Tails", async function () {
        const { flippedEvent, player } = await flip(7);

        expect(flippedEvent.name).to.equal("Flipped");
        expect(flippedEvent.args.player).to.equal(player.address);
        expect(flippedEvent.args.result).to.equal("Tails");
      });
    });
  });
});
