import PoWRemembranceToken from "./assets/PoWRemembranceToken";
import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
const contract = new ethers.Contract(
  PoWRemembranceToken.address,
  PoWRemembranceToken.abi,
  provider
);

export { provider, contract };
