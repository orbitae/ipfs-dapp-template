import type { AppProps } from "next/app";
import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { PROJECT_NAME } from "../app/config";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { createClient, chain, configureChains, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

const MyApp = ({ Component, pageProps }: AppProps) => {
  const { provider, chains } = configureChains(
    [chain.mainnet, chain.polygonMumbai],
    [alchemyProvider({ alchemyId: process.env.ALCHEMY_ID }), publicProvider()]
  );

  const { connectors } = getDefaultWallets({
    appName: PROJECT_NAME,
    chains,
  });

  const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
  });

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default MyApp;
