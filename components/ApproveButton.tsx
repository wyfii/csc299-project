"use client";
import React from "react";
import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  clusterApiUrl,
} from "@solana/web3.js";
import { HARDCODED_RPC_HEADERS, HARDCODED_RPC_URL } from "@/lib/utils";
import { trackTransactionApproved, trackUserAction } from "@/lib/analytics";
import { Button } from "./ui/button";
import * as multisig from "nova-multisig-sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import MultiSigApprovalModal from "./MultiSigApprovalModal";

type ApproveButtonProps = {
  rpcUrl: string;
  multisigPda: string;
  transactionIndex: number;
  proposalStatus: string;
  programId: string;
};

const ApproveButton = ({
  rpcUrl,
  multisigPda,
  transactionIndex,
  proposalStatus,
  programId,
}: ApproveButtonProps) => {
  const wallet = useWallet();
  const walletModal = useWalletModal();
  const router = useRouter();
  const [hasAlreadyApproved, setHasAlreadyApproved] = React.useState(false);
  const [showApprovalFlow, setShowApprovalFlow] = React.useState(false);
  const [multisigThreshold, setMultisigThreshold] = React.useState(1);
  
  const validKinds = [
    "Rejected",
    "Approved",
    "Executing",
    "Executed",
    "Cancelled",
  ];
  const isKindValid = validKinds.includes(proposalStatus || "None");
  const connection = new Connection(HARDCODED_RPC_URL, {
    commitment: "confirmed",
    httpHeaders: HARDCODED_RPC_HEADERS,
  } as any);

  // Check if current member has already approved & fetch threshold
  React.useEffect(() => {
    async function checkApprovalStatus() {
      if (!wallet.publicKey || proposalStatus === "None") {
        setHasAlreadyApproved(false);
        return;
      }

      try {
        // Fetch multisig to get threshold
        const multisigAccount = await multisig.accounts.Multisig.fromAccountAddress(
          connection,
          new PublicKey(multisigPda)
        );
        setMultisigThreshold(multisigAccount.threshold);

        const proposalPda = multisig.getProposalPda({
          multisigPda: new PublicKey(multisigPda),
          transactionIndex: BigInt(transactionIndex),
          programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
        })[0];

        const proposal = await multisig.accounts.Proposal.fromAccountAddress(
          connection,
          proposalPda
        );

        // Check if current wallet has already approved
        const alreadyApproved = proposal.approved.some(
          (approver) => approver.toBase58() === wallet.publicKey!.toBase58()
        );
        
        setHasAlreadyApproved(alreadyApproved);
        console.log("Has already approved:", alreadyApproved);
      } catch (error) {
        console.log("Could not fetch proposal (might not exist yet):", error);
        setHasAlreadyApproved(false);
      }
    }

    checkApprovalStatus();
  }, [wallet.publicKey, multisigPda, transactionIndex, proposalStatus, programId, connection]);

  const approveProposal = async () => {
    try {
      if (!wallet.publicKey) {
        walletModal.setVisible(true);
        return;
      }
      
      console.log("🔍 Approving transaction:", {
        multisigPda,
        transactionIndex,
        proposalStatus,
        member: wallet.publicKey.toBase58(),
      });
      
      const bigIntTransactionIndex = BigInt(transactionIndex);
      const instructions = [];
      
      // Add create proposal instruction if needed
      if (proposalStatus === "None") {
        console.log("📝 Creating proposal first...");
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
        console.log("🚀 Activating draft proposal...");
        const activateProposalInstruction =
          multisig.instructions.proposalActivate({
            multisigPda: new PublicKey(multisigPda),
            member: wallet.publicKey,
            transactionIndex: bigIntTransactionIndex,
            programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
          });
        instructions.push(activateProposalInstruction);
      }
      
      // Always add approve instruction
      console.log("✅ Adding approve instruction...");
      const approveProposalInstruction = multisig.instructions.proposalApprove({
        multisigPda: new PublicKey(multisigPda),
        member: wallet.publicKey,
        transactionIndex: bigIntTransactionIndex,
        programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
      });
      instructions.push(approveProposalInstruction);
      
      console.log(`📦 Built ${instructions.length} instruction(s)`);
      
      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      console.log("⛓️ Got blockhash:", blockhash.substring(0, 8) + "...");
      
      // Create versioned transaction
      const message = new TransactionMessage({
        instructions: instructions,
        payerKey: wallet.publicKey,
        recentBlockhash: blockhash,
      }).compileToV0Message();
      
      const transaction = new VersionedTransaction(message);
      
      // Simulate transaction first to catch any errors
      try {
        console.log("🧪 Simulating transaction first...");
        const simulation = await connection.simulateTransaction(transaction);
        console.log("Simulation result:", simulation);
        
        if (simulation.value.err) {
          console.error("❌ Simulation failed:", simulation.value.err);
          throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
        }
        console.log("✅ Simulation successful!");
      } catch (simError: any) {
        console.error("❌ Simulation error:", simError);
        throw new Error(`Failed to simulate: ${simError.message}`);
      }
      
      console.log("📤 Sending transaction to wallet...");
      console.log("Transaction details:", {
        version: transaction.version,
        signatures: transaction.signatures,
        message: {
          numInstructions: transaction.message.compiledInstructions.length,
          recentBlockhash: transaction.message.recentBlockhash,
        }
      });
      
      let signature;
      try {
        signature = await wallet.sendTransaction(transaction, connection, {
          skipPreflight: false, // Enable preflight to catch errors early
          maxRetries: 3,
        });
        console.log("✅ Transaction signature:", signature);
      } catch (sendError: any) {
        console.error("❌ Wallet sendTransaction failed:");
        console.error("Error name:", sendError.name);
        console.error("Error message:", sendError.message);
        console.error("Error cause:", sendError.cause);
        console.error("Full error:", sendError);
        throw new Error(`Wallet failed to send transaction: ${sendError.message || sendError.toString()}`);
      }
      toast.loading("Confirming...", {
        id: "transaction",
      });
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }
      
      console.log("🎉 Transaction confirmed!");
      router.refresh();
    } catch (error: any) {
      console.error("❌ Error approving transaction:", error);
      console.error("Error details:", {
        message: error.message,
        logs: error.logs,
        stack: error.stack,
      });
      throw error;
    }
  };
  return (
    <>
      <Button
        disabled={isKindValid}
        onClick={() => {
          if (!wallet.publicKey) {
            walletModal.setVisible(true);
            return;
          }
          // Open the multi-sig approval flow modal
          setShowApprovalFlow(true);
        }}
        className="mr-2"
      >
        View Approval Status
      </Button>

      <MultiSigApprovalModal
        isOpen={showApprovalFlow}
        onClose={() => setShowApprovalFlow(false)}
        multisigPda={multisigPda}
        transactionIndex={transactionIndex}
        programId={programId}
        threshold={multisigThreshold}
        onApprovalComplete={() => {
          router.refresh();
        }}
      />
    </>
  );
};

export default ApproveButton;
