# VRF Hardhat Local Setup

This repository demonstrates a simple setup for using Chainlink VRF 2.5 for local development.

The project is a "Flip a Coin" application that provides a local development experience similar to a Node.js backend.

The frontend is a Next.js app with a button to flip a coin.

The backend is a smart contract deployed on Hardhat that generates a random number and returns "Tails" if it's even or "Heads" if it's odd.

This README explains how to set up and use the project.
If you want to dive into the details, I wrote a blog post about it: https://thothbaboon.github.io/blog/chainlink-vrf-hardhat-local-setup/.

## Running the Project

### /hardhat

Install the dependencies:
```sh
npm install
```

Run the tests - everything should be green ✅:
```sh
npx hardhat test
```

Start a local network:
```sh
npx hardhat node
```

Deploy the contracts:
```sh
npx hardhat run scripts/deployLocal.ts --network localhost
```

The backend is ready! 🚀

### /app

Install the dependencies:
```sh
npm install
```

Start the app:
```sh
npm run dev
```

Open your browser and go to http://localhost:3000

## Usage

Open your browser's developer console to see the logs.

Click the **Flip** button.

You should see a request ID in the console.
The first time, the ID should be 1, and it increments with each flip.

When using the mock VRF, the random number request must be fulfilled manually.

Let's choose an odd number: `3` and run the fulfill request script:

```sh
NUMBER=3 REQUEST_ID=1 npx hardhat run scripts/fulfillVrfRequest.ts --network localhost
```

It displays `Tails`.

**Flip** again, but now let's fulfill request 2 with an even number: `4`:

```sh
NUMBER=4 REQUEST_ID=2 npx hardhat run scripts/fulfillVrfRequest.ts --network localhost
```

It displays `Heads`!

## Scripts

### copyAbi.js

After making changes to the **FlipCoin** contract:
- Compile the contracts to generate new artifacts
- Copy the ABI to /app using the script:

```sh
npx hardhat compile
node scripts/copyAbi.js
```

### wrapAbi.ts

To generate the typing for `VRFCoordinatorV2_5Mock`, the raw ABI first needs to be wrapped:
```sh
npx hardhat run scripts/wrapAbi.ts
npx typechain --target ethers-v6 --out-dir types abi/VRFCoordinatorV2_5Mock.json
```

### deployLocal.ts

Used by the unit tests and to set up the local environment.
It deploys the **VRF Coordinator**, the **FlipCoin** contract, and manages the **subscription**.
