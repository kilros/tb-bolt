import TBDMS from "../abis/TBDMS.json";
import TBFaucet from "../abis/TBFaucet.json";

export const TBDMSContract = {
  address: TBDMS.contractAddress,
  abi: TBDMS.abi,
};

export const TBFaucetContract = {
  address: TBFaucet.contractAddress,
  abi: TBFaucet.abi,
}