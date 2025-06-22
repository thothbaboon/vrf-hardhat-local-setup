const fs = require("fs");
const path = require("path");

const sourcePath = path.join(
  __dirname,
  "../artifacts/contracts/FlipCoin.sol/FlipCoin.json"
);
const destPath = path.join(
  __dirname,
  "../../app/contracts/abis/FlipCoin.json"
);

const contractArtifact = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

const abi = contractArtifact.abi;

fs.writeFileSync(destPath, JSON.stringify(abi, null, 2));

console.log("ABI copied successfully in App!");
