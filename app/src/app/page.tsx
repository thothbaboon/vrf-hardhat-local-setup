"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "../../contracts/abis/FlipCoin.json";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const signer = await provider.getSigner(1);

const flipCoinContractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
const flipCoin = new ethers.Contract(flipCoinContractAddress, abi, provider);
const flipCoinWithSigner = flipCoin.connect(signer);

export default function Home() {
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    // Set up event listener when component mounts
    const handleResult = (player: unknown, eventResult: unknown) => {
      console.log("Event received:", eventResult);
      setResult(eventResult as string);
    };

    flipCoin.on("Flipped", handleResult);

    // Cleanup event listener when component unmounts
    return () => {
      flipCoin.off("Flipped", handleResult);
    };
  }, []);

  async function handleFlip() {
    const flipTx = await (
      flipCoinWithSigner as ethers.Contract & {
        flip: () => Promise<ethers.ContractTransactionResponse>;
      }
    ).flip();
    const flipReceipt = await flipTx.wait();

    if (!flipReceipt) {
      throw new Error("Flip transaction failed");
    }

    const flippingEvent = flipCoin.interface.parseLog(flipReceipt.logs[1]);

    if (flippingEvent) {
      const { requestId } = flippingEvent.args;
      console.log("Request ID:", requestId.toString());
    }
  }

  return (
    <div>
      <h2>Flip A Coin</h2>

      <div>
        <button onClick={handleFlip}>Flip</button>
      </div>

      <div>{result}</div>
    </div>
  );
}
