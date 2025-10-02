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
import { Send, X } from "lucide-react";
import * as multisig from "nova-multisig-sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction, clusterApiUrl } from "@solana/web3.js";
import { HARDCODED_RPC_HEADERS, HARDCODED_RPC_URL } from "@/lib/utils";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { isPublickey } from "@/lib/isPublickey";
import { motion } from "framer-motion";

type SendSolProps = {
  rpcUrl: string;
  multisigPda: string;
  vaultIndex: number;
  programId?: string;
  asMenuItem?: boolean;
  asButton?: boolean;
};

const SendSol = ({
  rpcUrl,
  multisigPda,
  vaultIndex,
  programId,
  asMenuItem = false,
  asButton = false,
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
        {asMenuItem ? (
          <button
            onClick={(e) => {
              if (!wallet.publicKey) {
                e.preventDefault();
                walletModal.setVisible(true);
                return;
              }
            }}
            className="
              w-full px-4 py-2 text-left
              font-button uppercase
              text-gray-400 hover:text-orange-500 hover:bg-gray-900/50
              transition-all duration-200
              flex items-center gap-2
            "
          >
            <Send className="w-3 h-3" />
            Send
          </button>
        ) : asButton ? (
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="relative p-[2px]"
            style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-trench-orange to-orange-500" />
            <button
              onClick={(e) => {
                if (!wallet.publicKey) {
                  e.preventDefault();
                  walletModal.setVisible(true);
                  return;
                }
                setIsOpen(true);
              }}
              className="
                relative px-5 py-2 bg-black
                font-button uppercase tracking-widest
                text-trench-orange hover:text-orange-500
                transition-all duration-200
                flex items-center gap-2
              "
              style={{ clipPath: 'polygon(6px 0, calc(100% - 2px) 0, calc(100% - 2px) calc(100% - 6px), calc(100% - 6px) calc(100% - 2px), 2px calc(100% - 2px), 2px 6px)' }}
            >
              <Send className="w-3 h-3" />
              <span>Send</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="relative p-[2px]"
            style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800" />
            <button
              onClick={(e) => {
                if (!wallet.publicKey) {
                  e.preventDefault();
                  walletModal.setVisible(true);
                  return;
                }
                setIsOpen(true);
              }}
              className="
                relative px-5 py-2 bg-black
                font-button uppercase tracking-widest
                text-gray-300 hover:text-gray-200 hover:bg-gray-900/50
                transition-all duration-200
                flex items-center gap-2
              "
              style={{ clipPath: 'polygon(6px 0, calc(100% - 2px) 0, calc(100% - 2px) calc(100% - 6px), calc(100% - 6px) calc(100% - 2px), 2px calc(100% - 2px), 2px 6px)' }}
            >
              <Send className="w-3 h-3" />
              <span>Send</span>
            </button>
          </motion.div>
        )}
      </DialogTrigger>
      <DialogContent 
        className="max-w-md p-0 overflow-hidden border-0 bg-transparent"
      >
        <div className="relative p-[2px]"
             style={{ clipPath: 'polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)' }}>
          <div className="absolute inset-0 bg-gray-800" />
          <div className="relative bg-black"
               style={{ clipPath: 'polygon(14px 0, calc(100% - 2px) 0, calc(100% - 2px) calc(100% - 14px), calc(100% - 14px) calc(100% - 2px), 2px calc(100% - 2px), 2px 14px)' }}
          >
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 z-10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-gray-800 p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white uppercase tracking-wider">
              Send SOL
            </DialogTitle>
            <DialogDescription className="text-gray-400 mt-2">
              Create a proposal to transfer SOL
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
        
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Recipient</label>
              {recipient !== wallet.publicKey?.toBase58() && (
                <button
                  onClick={() => setRecipient(wallet.publicKey?.toBase58() || "")}
                  className="text-xs text-trench-orange hover:text-orange-500 font-button uppercase"
                >
                  Use my wallet
                </button>
              )}
            </div>
            
            {savedRecipients.length > 0 && (
              <select
                className="w-full bg-gray-900 border border-gray-800 px-3 py-2 text-sm text-white font-mono"
                style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
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
              placeholder={wallet.publicKey ? `${wallet.publicKey.toBase58().slice(0,4)}...${wallet.publicKey.toBase58().slice(-4)} (your wallet)` : "Recipient address"}
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="font-mono text-xs"
            />
            {recipient && !isPublickey(recipient) && (
              <p className="text-xs text-red-400">Invalid recipient address</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Amount</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-mono">
                  {(vaultBalance / LAMPORTS_PER_SOL).toFixed(6)} SOL
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={setMaxAmount}
                  className="px-2 py-1 bg-gray-900 border border-gray-800 text-xs font-button uppercase text-gray-400 hover:text-white"
                  style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
                >
                  MAX
                </motion.button>
              </div>
            </div>
            <Input
              placeholder="0.0"
              type="number"
              step="0.000000001"
              min="0"
              max={getMaxTransferAmount()}
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="font-mono"
            />
            {amount > getMaxTransferAmount() && (
              <p className="text-xs text-red-400">
                ⚠️ Max: {getMaxTransferAmount().toFixed(6)} SOL (keeping {MIN_VAULT_RESERVE} SOL reserve)
              </p>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              toast.promise(transfer, {
                id: "transaction",
                loading: "Loading...",
                success: "Transfer proposed.",
                error: (e) => `Failed to propose: ${e}`,
              })
            }
            disabled={!isPublickey(recipient) || amount <= 0 || amount > getMaxTransferAmount()}
            className="
              w-full px-6 py-3
              bg-trench-orange hover:bg-orange-500
              font-button uppercase tracking-wider
              text-black
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
            style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
          >
            {amount > 0 ? `Send ${amount} SOL` : 'Send SOL'}
          </motion.button>
        </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendSol;
