"use client";
import React, { FC, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { CoinbaseWalletAdapter } from "@solana/wallet-adapter-coinbase";
import { LedgerWalletAdapter } from "@solana/wallet-adapter-wallets";
import { TrustWalletAdapter } from "@solana/wallet-adapter-wallets";
import { Coin98WalletAdapter } from "@solana/wallet-adapter-coin98";
// import { StandardWalletAdapter } from "@solana/wallet-standard-wallet-adapter";
import { HARDCODED_RPC_URL } from "@/lib/utils";

require("@solana/wallet-adapter-react-ui/styles.css");

type Props = {
  children?: React.ReactNode;
};

export const Wallet: FC<Props> = ({ children }) => {
  const endpoint = useMemo(() => HARDCODED_RPC_URL, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new LedgerWalletAdapter(),
      new TrustWalletAdapter(),
      new Coin98WalletAdapter(),
      // new StandardWalletAdapter(), // Auto-detects Backpack and other Wallet Standard wallets
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
