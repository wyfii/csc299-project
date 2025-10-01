"use client";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { AlertTriangle } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import * as multisig from "nova-multisig-sdk";

interface MultisigAddressDisplayProps {
  multisigAddress: string;
}

export default function MultisigAddressDisplay({ multisigAddress }: MultisigAddressDisplayProps) {
  const { publicKey } = useWallet();
  
  // Calculate vault address from multisig address
  const [vaultAddress] = multisig.getVaultPda({
    multisigPda: new PublicKey(multisigAddress),
    index: 0, // Assuming vault index 0
  });
  
  const copyAddress = () => {
    navigator.clipboard.writeText(vaultAddress.toBase58());
    toast.success("Vault address copied!");
  };

  const resetMultisig = () => {
    if (confirm("Reset to your wallet's multisig from Firestore?")) {
      document.cookie = 'x-multisig=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
      toast.success("Resetting to your multisig...", { duration: 2000 });
      setTimeout(() => location.reload(), 1000);
    }
  };

  return (
    <div className="mb-4 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-400 font-sans">Your Vault Address:</p>
        <button
          onClick={resetMultisig}
          className="text-xs text-orange-400 hover:text-orange-300 underline font-sans"
        >
          Reset to my multisig
        </button>
      </div>
      <div className="flex items-center gap-2">
        <p className="font-mono text-sm text-orange-500 font-semibold break-all">
          {vaultAddress.toBase58()}
        </p>
        <button
          onClick={copyAddress}
          className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors font-sans flex-shrink-0 border border-zinc-700"
        >
          Copy
        </button>
      </div>
      {publicKey && (
        <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-200 flex items-center gap-2">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          <span>
            Connected wallet: <span className="font-mono">{publicKey.toBase58().slice(0,4)}...{publicKey.toBase58().slice(-4)}</span>
            {' '}• This is your vault address where funds are stored • If you see errors, click &quot;Reset to my multisig&quot; above
          </span>
        </div>
      )}
    </div>
  );
}
