import {
  ChangeEvent,
  FC,
  FormEventHandler,
  MouseEventHandler,
  useEffect,
  useState,
} from "react";
import { SignMessageArgs, SignTypedDataArgs } from "@wagmi/core";
import {
  useAccount,
  useNetwork,
  useSignMessage,
  useSignTypedData,
} from "wagmi";
import { verifyMessage, verifyTypedData } from "ethers/lib/utils";
import { PROJECT_NAME } from "./config";

const eip712Schema = {
  Person: [
    { name: "name", type: "string" },
    { name: "wallet", type: "address" },
  ],
  Message: [
    { name: "from", type: "Person" },
    { name: "to", type: "Person" },
    { name: "message", type: "string" },
    { name: "timestamp", type: "uint256" },
  ],
};

enum SignatureType {
  personalSign = "personalSign",
  signTypedData = "signTypedData",
}

const MessageSignature: FC<{}> = () => {
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [validSignature, setValidSignature] = useState<string | undefined>(
    undefined
  );
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [signatureType, setSignatureType] = useState<SignatureType>(
    SignatureType.personalSign
  );

  const { activeChain } = useNetwork();
  const { data: account } = useAccount();
  const personalSign = useSignMessage({
    message,
  });

  const eip712Domain = {
    name: PROJECT_NAME,
    version: "0.1.0",
    chainId: activeChain?.id || 1,
  };

  const eip712Values = {
    from: {
      name: `${PROJECT_NAME} User`,
      wallet: account?.address,
    },
    to: {
      name: "Vitalik",
      wallet: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
    },
    message,
    timestamp: Date.now(),
  };

  const signTypedData = useSignTypedData({
    domain: eip712Domain,
    types: eip712Schema,
    value: eip712Values,
  });

  useEffect(() => {
    const signature =
      signatureType === SignatureType.personalSign
        ? personalSign
        : signTypedData;

    if (signature.isError) {
      setError(signature.error?.message || "Error signing message");
    }

    setIsLoading(signature.isLoading);

    if (signature.isSuccess && signature.data && message) {
      try {
        let signingAddress: string = "";

        if (signatureType === SignatureType.personalSign) {
          const { message } = signature.variables as SignMessageArgs;

          signingAddress = verifyMessage(message, signature.data);
        } else {
          const { domain, types, value } =
            signature.variables as SignTypedDataArgs;

          signingAddress = verifyTypedData(
            domain,
            types,
            value,
            signature.data
          );
        }

        if (signingAddress === account?.address) {
          setValidSignature(signature.data);
        } else {
          setError(`Invalid signature - Signing Address: ${signingAddress}`);
        }
      } catch (error) {
        setError(error as string);
      }
    }
  }, [personalSign, signTypedData]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(undefined), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleMessageChange: FormEventHandler<HTMLTextAreaElement> = (e) => {
    const target = e.target as HTMLTextAreaElement;

    setMessage(target.value || undefined);
  };

  const handleSign: MouseEventHandler<HTMLButtonElement> = () => {
    setValidSignature(undefined);

    if (!account?.address) {
      setError("Please connect your wallet");
      return;
    }

    if (!message) {
      setError("Please type a message");
      return;
    }

    try {
      if (signatureType === "personalSign") {
        personalSign.signMessage();
      } else {
        signTypedData.signTypedData();
      }
    } catch (error) {
      setError(error as string);
    }
  };

  return (
    <div className="container rounded-xl bg-blue-900/20 p-3 text-white text-sm">
      <div className="flex flex-col space-y-2 mx-auto w-full md:w-9/12 lg:w-1/2">
        <p className="text-base font-medium">Account</p>
        <p>{account?.address || "Not Connected"}</p>
        <p className="text-base font-medium pt-2">Signature Method</p>
        <select
          id="signature-method"
          name="signatureMethod"
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            setSignatureType(e.target.value as SignatureType);
          }}
          value={signatureType}
          className="block py-2 px-3 bg-blue-900/20 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500m"
        >
          <option value={SignatureType.personalSign}>Personal Sign</option>
          <option value={SignatureType.signTypedData}>Sign Typed Data</option>
        </select>
        <p className="text-base font-medium pt-2">Message</p>
        <div className="mt-1">
          <textarea
            id="message"
            name="message"
            rows={2}
            className="bg-blue-900/20 focus:ring-indigo-500 focus:border-indigo-500 block border border-gray-300 rounded-md w-full"
            placeholder="Write the message to sign"
            value={message}
            onInput={handleMessageChange}
          />
        </div>
        <div className="flex w-full pt-4">
          <button
            onMouseDown={handleSign}
            className="inline-flex w-20 justify-center mx-auto py-2 px-4 border border-transparent shadow-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign
          </button>
        </div>
        {/* Loading Section */}
        {isLoading && (
          <div className="p-5">
            <div className="flex items-center justify-center">
              <div className="w-10 h-10 border-b-2 border-white rounded-full animate-spin" />
            </div>
          </div>
        )}
        {/* Valid Signature */}
        {validSignature && (
          <>
            <p className="text-base font-medium pt-2">Message signed!</p>
            <p className="break-all">{validSignature}</p>
          </>
        )}
        {/* Error */}
        {error && (
          <div className="py-3 w-full">
            <div
              className="bg-rose-100 text-rose-600 font-medium rounded-md py-2 px-3"
              role="alert"
            >
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageSignature;
