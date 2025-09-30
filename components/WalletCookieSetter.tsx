"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";

// This component sets a cookie with the connected wallet address
// so the server can query Firestore for the user's multisig
export default function WalletCookieSetter() {
  const { publicKey, connected } = useWallet();

  useEffect(() => {
    if (connected && publicKey) {
      const walletAddress = publicKey.toBase58();
      // Set wallet address cookie
      document.cookie = `x-wallet=${walletAddress}; path=/; max-age=31536000`; // 1 year
      console.log("Set wallet cookie:", walletAddress);
    } else {
      // Clear wallet cookie when disconnected
      document.cookie = `x-wallet=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
      console.log("Cleared wallet cookie");
    }
  }, [connected, publicKey]);

  return null; // This component doesn't render anything
}
