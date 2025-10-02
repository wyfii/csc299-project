"use client";
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
import { Send } from "lucide-react";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import * as multisig from "nova-multisig-sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, TransactionMessage, VersionedTransaction, clusterApiUrl } from "@solana/web3.js";
import { HARDCODED_RPC_HEADERS, HARDCODED_RPC_URL } from "@/lib/utils";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { isPublickey } from "@/lib/isPublickey";

type SendTokensProps = {
  tokenAccount: string;
  mint: string;
  decimals: number;
  tokenBalance: number;
  rpcUrl: string;
  multisigPda: string;
  vaultIndex: number;
  programId?: string;
  asMenuItem?: boolean;
};

const SendTokens = ({
  tokenAccount,
  mint,
  decimals,
  tokenBalance,
  rpcUrl,
  multisigPda,
  vaultIndex,
  programId,
  asMenuItem = false,
}: SendTokensProps) => {
  const wallet = useWallet();
  const walletModal = useWalletModal();
  const [amount, setAmount] = useState(0);
  const [recipient, setRecipient] = useState("");
  const router = useRouter();

  const transfer = async () => {
    if (!wallet.publicKey) {
      return;
    }

    // Validate amount before creating transaction
    console.log('💰 Token Transfer Validation:', {
      tokenAccount,
      availableBalance: tokenBalance,
      requestedAmount: amount,
      hasEnough: tokenBalance >= amount,
    });

    if (amount > tokenBalance) {
      toast.error(
        <div className="flex flex-col gap-1">
          <span>❌ Insufficient tokens in vault!</span>
          <span className="text-xs">Available: {tokenBalance} tokens</span>
          <span className="text-xs">Requested: {amount} tokens</span>
        </div>,
        { id: 'transfer', duration: 10000 }
      );
      return;
    }

    const recipientATA = getAssociatedTokenAddressSync(
      new PublicKey(mint),
      new PublicKey(recipient),
      true
    );

    const vaultAddress = multisig
      .getVaultPda({
        index: vaultIndex,
        multisigPda: new PublicKey(multisigPda),
        programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
      })[0]
      .toBase58();

    const createRecipientATAInstruction =
      createAssociatedTokenAccountIdempotentInstruction(
        new PublicKey(vaultAddress),
        recipientATA,
        new PublicKey(recipient),
        new PublicKey(mint)
      );

    const transferInstruction = createTransferCheckedInstruction(
      new PublicKey(tokenAccount),
      new PublicKey(mint),
      recipientATA,
      new PublicKey(vaultAddress),
      amount * 10 ** decimals,
      decimals
    );

    const connection = new Connection(HARDCODED_RPC_URL, {
      commitment: "confirmed",
      httpHeaders: HARDCODED_RPC_HEADERS,
    } as any);

    const multisigInfo = await multisig.accounts.Multisig.fromAccountAddress(
      connection,
      new PublicKey(multisigPda)
    );

    const blockhash = (await connection.getLatestBlockhash()).blockhash;

    const transferMessage = new TransactionMessage({
      instructions: [createRecipientATAInstruction, transferInstruction],
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
        <span>Token transfer proposed & auto-approved! 🎉</span>
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
  };

  return (
    <Dialog>
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
        ) : (
          <Button
            onClick={(e) => {
              if (!wallet.publicKey) {
                e.preventDefault();
                walletModal.setVisible(true);
                return;
              }
            }}
            className="bg-white text-black hover:bg-gray-200 rounded-full px-4 py-1.5 text-xs font-medium transition-colors"
          >
            SEND
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer tokens</DialogTitle>
          <DialogDescription>
            Create a proposal to transfer tokens to another address.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Recipient"
          type="text"
          onChange={(e) => setRecipient(e.target.value)}
        />
        {isPublickey(recipient) ? null : (
          <p className="text-xs">Invalid recipient address</p>
        )}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-400">Amount</label>
            <span className="text-xs text-gray-500">
              Available: {tokenBalance} tokens
            </span>
          </div>
          <Input
            placeholder="Amount (token amount, e.g., 10 or 0.5)"
            type="number"
            step="0.000000001"
            min="0"
            max={tokenBalance}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          />
          {amount > tokenBalance && (
            <p className="text-xs text-red-400">
              ⚠️ Amount exceeds token balance! Max: {tokenBalance}
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
          disabled={!isPublickey(recipient) || amount <= 0 || amount > tokenBalance}
        >
          Transfer
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SendTokens;
