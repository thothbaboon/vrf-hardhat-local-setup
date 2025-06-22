import { deployLocalContracts } from "../helpers/deployLocalContracts";

deployLocalContracts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
