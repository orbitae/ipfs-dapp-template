import poolABI from "./utils/poolABI";
import { FC, useState } from "react";
import { POOL_CONTRACT_ADDRESS } from "./config";
import { useContractEvent, useNetwork } from "wagmi";
import { BigNumber, FixedNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { mainnet } from "wagmi/chains";

type filteredSwapEvent = [string, string, BigNumber, BigNumber];

enum SwapAction {
  BUY = "Buy",
  SELL = "Sell",
}

interface Swap {
  action: SwapAction;
  rate: string;
  daiAmount: string;
  ethAmount: string;
  maker: string;
}

const MAX_SWAP_AMOUNT = 10;

const PoolTracker: FC<{}> = () => {
  const [swapList, setSwapList] = useState<Swap[]>([]);
  const network = useNetwork();

  useContractEvent(
    {
      addressOrName: POOL_CONTRACT_ADDRESS,
      contractInterface: poolABI,
    },
    "Swap",
    (e) => {
      console.log(e);
      updateSwapsList(e.slice(0, 4) as filteredSwapEvent);
    }
  );

  const formatValues = (v: string) => {
    return FixedNumber.fromString(v).round(4).toString();
  };

  const updateSwapsList = (swapEvent: filteredSwapEvent) => {
    const daiAmount = formatEther(swapEvent[2].abs());
    const ethAmount = formatEther(swapEvent[3].abs());
    const rate = parseFloat(daiAmount) / parseFloat(ethAmount);

    const formattedSwap: Swap = {
      action: swapEvent[2].gt(0) ? SwapAction.BUY : SwapAction.SELL,
      rate: rate.toString(),
      daiAmount,
      ethAmount,
      maker: swapEvent[0],
    };

    const newList = swapList.concat(formattedSwap);

    if (newList.length > MAX_SWAP_AMOUNT) {
      newList.shift();
    }

    setSwapList(newList);
  };

  return (
    <div className="container rounded-xl bg-blue-900/20 p-3 text-white text-sm">
      <div className="flex flex-col space-y-3 mx-auto w-full">
        {mainnet.id !== network.activeChain?.id && network.activeChain && (
          <>
            <p className="text-base font-medium">
              Please connect to Polygon Mumbai
            </p>
            <button
              className="inline-flex w-36 justify-center mx-auto py-2 px-4 border border-transparent shadow-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => network.switchNetwork?.(mainnet.id)}
            >
              Switch Network
            </button>
          </>
        )}
        <p className="text-base font-medium pb-2">
          Latest swaps for the Uniswap V3 DAI-ETH pool
        </p>
        {/* Swaps */}
        <div className="flex flex-col space-y-1 w-full font-mono text-center">
          <div className="flex justify-between basis-8 p-2 bg-blue-700/20 w-full">
            <p>Action</p>
            <p>Rate</p>
            <p>DAI</p>
            <p>ETH</p>
            <p>Maker Address</p>
          </div>
          {swapList.map((swap, i) => {
            return (
              <div
                className="flex justify-between basis-8 p-2 bg-blue-700/20 w-full"
                key={i.toString()}
              >
                <p>{swap.action}</p>
                <p>{formatValues(swap.rate)}</p>
                <p>{formatValues(swap.daiAmount)}</p>
                <p>{formatValues(swap.ethAmount)}</p>
                <a
                  href={`https://etherscan.io/address/${swap.maker}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <p>{`${swap.maker.slice(0, 6)}...${swap.maker.slice(-4)}`}</p>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PoolTracker;
