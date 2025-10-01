"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useState } from "react";
import * as multisig from "nova-multisig-sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction, clusterApiUrl } from "@solana/web3.js";
import { HARDCODED_RPC_HEADERS, HARDCODED_RPC_URL } from "@/lib/utils";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { isPublickey } from "@/lib/isPublickey";

type SendSolProps = {
  rpcUrl: string;
  multisigPda: string;
  vaultIndex: number;
  programId?: string;
};

const SendSol = ({
  rpcUrl,
  multisigPda,
  vaultIndex,
  programId,
}: SendSolProps) => {
  const wallet = useWallet();
  const walletModal = useWalletModal();
  const [amount, setAmount] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [vaultBalance, setVaultBalance] = useState<number>(0);
  const [savedRecipients, setSavedRecipients] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const connection = React.useMemo(
    () => new Connection(HARDCODED_RPC_URL, {
      commitment: "confirmed",
      httpHeaders: HARDCODED_RPC_HEADERS,
    } as any),
    []
  );

  // Minimum rent-exempt balance (keep in vault)
  const RENT_EXEMPT_MINIMUM = 0.00089088; // ~890,880 lamports
  const MIN_VAULT_RESERVE = 0.001; // Keep at least 0.001 SOL in vault

  // Load saved recipients from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('nova-recipients-sol');
    if (saved) {
      try {
        setSavedRecipients(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved recipients:', e);
      }
    }
  }, []);

  // Fetch vault balance and set default recipient to user's wallet
  React.useEffect(() => {
    if (!isOpen) return;

    async function fetchVaultBalance() {
      const vaultAddress = multisig.getVaultPda({
        index: vaultIndex,
        multisigPda: new PublicKey(multisigPda),
        programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
      })[0];
      
      const balance = await connection.getBalance(vaultAddress);
      setVaultBalance(balance);
    }
    
    // Auto-fill recipient with user's wallet if empty
    if (!recipient && wallet.publicKey) {
      setRecipient(wallet.publicKey.toBase58());
    }
    
    fetchVaultBalance();
  }, [isOpen, multisigPda, vaultIndex, programId, connection, wallet.publicKey, recipient]);

  const saveRecipient = (address: string) => {
    if (!isPublickey(address)) return;
    
    const updated = [address, ...savedRecipients.filter(a => a !== address)].slice(0, 10); // Keep last 10
    setSavedRecipients(updated);
    localStorage.setItem('nova-recipients-sol', JSON.stringify(updated));
  };

  const getMaxTransferAmount = () => {
    const availableSOL = vaultBalance / LAMPORTS_PER_SOL;
    // Keep minimum reserve for rent
    const maxAmount = Math.max(0, availableSOL - MIN_VAULT_RESERVE);
    return maxAmount;
  };

  const setMaxAmount = () => {
    const max = getMaxTransferAmount();
    setAmount(max);
    toast.info(`Max amount set: ${max.toFixed(6)} SOL (keeping ${MIN_VAULT_RESERVE} SOL reserve)`, {
      duration: 3000
    });
  };

  const transfer = async () => {
    if (!wallet.publicKey) {
      return;
    }

    const vaultAddress = multisig.getVaultPda({
      index: vaultIndex,
      multisigPda: new PublicKey(multisigPda),
      programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
    })[0];

    // Check if vault has enough SOL (including reserve)
    const requestedLamports = amount * LAMPORTS_PER_SOL;
    const availableSOL = vaultBalance / LAMPORTS_PER_SOL;
    const maxTransfer = getMaxTransferAmount();

    console.log('💰 Transfer Validation:', {
      vaultAddress: vaultAddress.toBase58(),
      vaultBalance: availableSOL,
      requestedAmount: amount,
      maxTransfer: maxTransfer,
      reserve: MIN_VAULT_RESERVE,
      hasEnough: amount <= maxTransfer,
    });

    if (amount > maxTransfer) {
      toast.error(
        <div className="flex flex-col gap-1">
          <span>❌ Amount exceeds available funds!</span>
          <span className="text-xs">Vault balance: {availableSOL.toFixed(6)} SOL</span>
          <span className="text-xs">Max sendable: {maxTransfer.toFixed(6)} SOL</span>
          <span className="text-xs text-gray-400">(Keeping {MIN_VAULT_RESERVE} SOL reserve for rent)</span>
        </div>,
        { id: 'transfer', duration: 10000 }
      );
      return;
    }

    // Save recipient to history
    saveRecipient(recipient);

    const transferInstruction = SystemProgram.transfer({
      fromPubkey: vaultAddress,
      toPubkey: new PublicKey(recipient),
      lamports: requestedLamports,
    });

    const multisigInfo = await multisig.accounts.Multisig.fromAccountAddress(
      connection,
      new PublicKey(multisigPda)
    );

    const blockhash = (await connection.getLatestBlockhash()).blockhash;

    const transferMessage = new TransactionMessage({
      instructions: [transferInstruction],
      payerKey: wallet.publicKey,
      recentBlockhash: blockhash,
    });

    const transactionIndex = Number(multisigInfo.transactionIndex) + 1;
    const transactionIndexBN = BigInt(transactionIndex);

    const multisigTransactionIx = multisig.instructions.vaultTransactionCreate({
      multisigPda: new PublicKey(multisigPda),
      creator: wallet.publicKey,
      ephemeralSigners: 0,
      transactionMessage: transferMessage,
      transactionIndex: transactionIndexBN,
      addressLookupTableAccounts: [],
      rentPayer: wallet.publicKey,
      vaultIndex: vaultIndex,
      programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
    });
    const proposalIx = multisig.instructions.proposalCreate({
      multisigPda: new PublicKey(multisigPda),
      creator: wallet.publicKey,
      isDraft: false,
      transactionIndex: transactionIndexBN,
      rentPayer: wallet.publicKey,
      programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
    });
    const approveIx = multisig.instructions.proposalApprove({
      multisigPda: new PublicKey(multisigPda),
      member: wallet.publicKey,
      transactionIndex: transactionIndexBN,
      programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
    });

    const message = new TransactionMessage({
      instructions: [multisigTransactionIx, proposalIx, approveIx],
      payerKey: wallet.publicKey,
      recentBlockhash: blockhash,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(message);

    const signature = await wallet.sendTransaction(transaction, connection, {
      skipPreflight: true,
    });
    console.log("Transaction signature", signature);
    toast.loading("Confirming...", {
      id: "transaction",
    });
    await connection.getSignatureStatuses([signature]);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Show success with clickable Solscan link
    toast.success(
      <div className="flex flex-col gap-1">
        <span>Transfer proposed & auto-approved! 🎉</span>
        <span className="text-xs text-gray-400">You&apos;ve already approved this transaction</span>
        <a 
          href={`https://solscan.io/tx/${signature}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-400 hover:text-orange-300 underline text-xs"
        >
          View on Solscan →
        </a>
      </div>,
      { id: "transaction", duration: 10000 }
    );
    router.refresh();
    setIsOpen(false); // Close dialog after success
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={(e) => {
            if (!wallet.publicKey) {
              e.preventDefault()
              walletModal.setVisible(true);
              return;
            }
          }}
          className="bg-white text-black hover:bg-gray-200 rounded-full px-4 py-1.5 text-xs font-medium transition-colors"
        >
          SEND
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer SOL</DialogTitle>
          <DialogDescription>
            Create a proposal to transfer SOL to another address.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-400">Recipient</label>
            {savedRecipients.length > 0 && (
              <button
                onClick={() => setRecipient(wallet.publicKey?.toBase58() || "")}
                className="text-xs text-orange-400 hover:text-orange-300"
              >
                Use my wallet
              </button>
            )}
          </div>
          
          {savedRecipients.length > 0 && (
            <select
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm"
              onChange={(e) => setRecipient(e.target.value)}
              value=""
            >
              <option value="">Recent recipients...</option>
              {savedRecipients.map((addr, i) => (
                <option key={i} value={addr}>
                  {addr.slice(0, 8)}...{addr.slice(-8)}
                </option>
              ))}
            </select>
          )}
          
          <Input
            placeholder={wallet.publicKey ? `Default: ${wallet.publicKey.toBase58().slice(0,4)}...${wallet.publicKey.toBase58().slice(-4)} (your wallet)` : "Recipient address"}
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          {isPublickey(recipient) ? null : (
            <p className="text-xs text-red-400">Invalid recipient address</p>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-400">Amount</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                Available: {(vaultBalance / LAMPORTS_PER_SOL).toFixed(6)} SOL
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={setMaxAmount}
                className="h-6 px-2 text-xs"
              >
                MAX
              </Button>
            </div>
          </div>
          <Input
            placeholder="Amount (e.g., 0.1 for 0.1 SOL)"
            type="number"
            step="0.000000001"
            min="0"
            max={getMaxTransferAmount()}
            value={amount || ''}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          />
          {amount > getMaxTransferAmount() && (
            <p className="text-xs text-red-400">
              ⚠️ Amount exceeds available! Max: {getMaxTransferAmount().toFixed(6)} SOL (keeping {MIN_VAULT_RESERVE} SOL reserve)
            </p>
          )}
          {vaultBalance > 0 && (
            <p className="text-xs text-gray-500">
              💡 Tip: We keep {MIN_VAULT_RESERVE} SOL in the vault for rent-exemption
            </p>
          )}
        </div>
        <Button
          onClick={() =>
            toast.promise(transfer, {
              id: "transaction",
              loading: "Loading...",
              success: "Transfer proposed.",
              error: (e) => `Failed to propose: ${e}`,
            })
          }
          disabled={!isPublickey(recipient) || amount <= 0 || amount > getMaxTransferAmount()}
        >
          Transfer {amount > 0 ? `${amount} SOL` : ''}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SendSol;
