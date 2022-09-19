import nftABI from "./utils/nftABI";
import { ChangeEvent, FC, MouseEventHandler, useEffect, useState } from "react";
import { NFT_CONTRACT_ADDRESS } from "./config";
import { useAccount, useNetwork, useContractWrite } from "wagmi";
import { polygonMumbai } from "wagmi/chains";

const MintNFT: FC<{}> = () => {
  const [NFTAmount, setNFTAmount] = useState<string>("1");
  const [transactionHash, setTransactionHash] = useState<string | undefined>(
    undefined
  );
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const network = useNetwork();

  const { data: account } = useAccount();

  const contractWrite = useContractWrite(
    {
      addressOrName: NFT_CONTRACT_ADDRESS,
      contractInterface: nftABI,
    },
    "mintNFTs",
    { args: ["1"] }
  );

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(undefined), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleMint: MouseEventHandler<HTMLButtonElement> = () => {
    if (!account?.address) {
      setError("Please connect your wallet");
      return;
    }

    if (polygonMumbai.id !== network.activeChain?.id) {
      setError("Please connect to Polygon Mumbai");
      return;
    }

    try {
      setIsLoading(contractWrite.isLoading);

      contractWrite.write();
    } catch (error) {
      setError(error as string);
    }
  };

  useEffect(() => {
    if (contractWrite.isLoading) {
      return;
    }

    setIsLoading(false);

    if (contractWrite.isError) {
      setError(contractWrite.error?.message || "Error signing message");
    }

    if (contractWrite.data) {
      setTransactionHash(contractWrite.data.hash);
    }
  }, [contractWrite.isLoading]);

  return (
    <div className="container rounded-xl bg-blue-900/20 p-3 text-white text-sm">
      <div className="flex flex-col space-y-2 mx-auto w-full md:w-9/12 lg:w-1/2">
        {polygonMumbai.id !== network.activeChain?.id && network.activeChain && (
          <>
            <p className="text-base font-medium">
              Please connect to Polygon Mumbai
            </p>
            <button
              className="inline-flex w-36 justify-center mx-auto py-2 px-4 border border-transparent shadow-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => network.switchNetwork?.(polygonMumbai.id)}
            >
              Switch Network
            </button>
          </>
        )}
        <p className="text-base font-medium">Account</p>
        <p>{account?.address || "Not Connected"}</p>
        <p className="text-base font-medium pt-2">NFT Amount</p>
        <select
          id="nft-amount"
          name="nft-amount"
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            setNFTAmount(e.target.value);
          }}
          value={NFTAmount}
          className="block py-2 px-3 bg-blue-900/20 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500m"
        >
          <option value="1">1</option>
          <option value="2">2</option>
        </select>
        <div className="flex w-full pt-4">
          <button
            onMouseDown={handleMint}
            className="inline-flex w-20 justify-center mx-auto py-2 px-4 border border-transparent shadow-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Mint
          </button>
        </div>
        {/* Loading Section */}
        {(isLoading || network.isLoading) && (
          <div className="p-5">
            <div className="flex items-center justify-center">
              <div className="w-10 h-10 border-b-2 border-white rounded-full animate-spin" />
            </div>
          </div>
        )}
        {/* Valid Signature */}
        {transactionHash && (
          <>
            <p className="text-base font-medium pt-2">NFT Minted!</p>
            <p className="break-all">{transactionHash}</p>
          </>
        )}
        {/* Error */}
        {(error || network.error) && (
          <div className="py-3 w-full">
            <div
              className="bg-rose-100 text-rose-600 font-medium rounded-md py-2 px-3"
              role="alert"
            >
              {error || network.error?.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MintNFT;
