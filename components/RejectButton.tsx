"use client";
import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  clusterApiUrl,
} from "@solana/web3.js";
import { HARDCODED_RPC_HEADERS, HARDCODED_RPC_URL } from "@/lib/utils";
import { Button } from "./ui/button";
import * as multisig from "nova-multisig-sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type RejectButtonProps = {
  rpcUrl: string;
  multisigPda: string;
  transactionIndex: number;
  proposalStatus: string;
  programId: string;
};

const RejectButton = ({
  rpcUrl,
  multisigPda,
  transactionIndex,
  proposalStatus,
  programId,
}: RejectButtonProps) => {
  const wallet = useWallet();
  const walletModal = useWalletModal();
  const router = useRouter();

  const connection = new Connection(HARDCODED_RPC_URL, {
    commitment: "confirmed",
    httpHeaders: HARDCODED_RPC_HEADERS,
  } as any);

  const validKinds = ["None", "Active", "Draft"];
  const isKindValid = validKinds.includes(proposalStatus);

  const rejectTransaction = async () => {
    if (!wallet.publicKey) {
      walletModal.setVisible(true);
      return;
    }
    
    const bigIntTransactionIndex = BigInt(transactionIndex);

    if (!isKindValid) {
      toast.error("You can't reject this proposal.");
      return;
    }

    const instructions = [];
    
    // Add create proposal instruction if needed
    if (proposalStatus === "None") {
      const createProposalInstruction = multisig.instructions.proposalCreate({
        multisigPda: new PublicKey(multisigPda),
        creator: wallet.publicKey,
        isDraft: false,
        transactionIndex: bigIntTransactionIndex,
        rentPayer: wallet.publicKey,
        programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
      });
      instructions.push(createProposalInstruction);
    }
    
    // Add activate proposal instruction if needed
    if (proposalStatus === "Draft") {
      const activateProposalInstruction =
        multisig.instructions.proposalActivate({
          multisigPda: new PublicKey(multisigPda),
          member: wallet.publicKey,
          transactionIndex: bigIntTransactionIndex,
          programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
        });
      instructions.push(activateProposalInstruction);
    }
    
    // Always add reject instruction
    const rejectProposalInstruction = multisig.instructions.proposalReject({
      multisigPda: new PublicKey(multisigPda),
      member: wallet.publicKey,
      transactionIndex: bigIntTransactionIndex,
      programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
    });
    instructions.push(rejectProposalInstruction);

    // Get latest blockhash
    const blockhash = (await connection.getLatestBlockhash()).blockhash;
    
    // Create versioned transaction
    const message = new TransactionMessage({
      instructions: instructions,
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
        <span>Transaction rejected! ✅</span>
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
    <Button
      disabled={!isKindValid}
      onClick={() =>
        toast.promise(rejectTransaction, {
          id: "transaction",
          loading: "Loading...",
          success: "Transaction rejected.",
          error: (e) => `Failed to reject: ${e}`,
        })
      }
      className="mr-2"
    >
      Reject
    </Button>
  );
};

export default RejectButton;
