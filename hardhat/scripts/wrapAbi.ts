import fs from 'fs';
import abi from '../node_modules/@chainlink/contracts/abi/v0.8/VRFCoordinatorV2_5Mock.json';

const wrapped = {
  contractName: "VRFCoordinatorV2_5Mock",
  abi: abi
};

fs.writeFileSync('./abi/VRFCoordinatorV2_5Mock.json', JSON.stringify(wrapped, null, 2));
