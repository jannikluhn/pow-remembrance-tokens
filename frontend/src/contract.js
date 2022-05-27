import POWRemembranceToken from "./assets/POWRemembranceToken";
import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
const contract = new ethers.Contract(
  POWRemembranceToken.address,
  POWRemembranceToken.abi,
  provider
);

export { provider, contract };
