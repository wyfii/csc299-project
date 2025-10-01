"use client";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import * as multisig from "nova-multisig-sdk";
import { HARDCODED_RPC_HEADERS, HARDCODED_RPC_URL } from "@/lib/utils";
import { trackTransactionApproved, trackUserAction, trackError } from "@/lib/analytics";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, Wallet, ArrowRight, Users, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

type Member = {
  address: string;
  hasApproved: boolean;
  isCurrentWallet: boolean;
  balance?: number; // SOL balance in lamports
};

type MultiSigApprovalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  multisigPda: string;
  transactionIndex: number;
  programId: string;
  threshold: number;
  onApprovalComplete: () => void;
};

export default function MultiSigApprovalModal({
  isOpen,
  onClose,
  multisigPda,
  transactionIndex,
  programId,
  threshold,
  onApprovalComplete,
}: MultiSigApprovalModalProps) {
  const wallet = useWallet();
  const walletModal = useWalletModal();
  const { publicKey, disconnect } = wallet;
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalApprovals, setTotalApprovals] = useState(0);
  const [isApproving, setIsApproving] = useState(false);
  const [proposalStatus, setProposalStatus] = useState("None");
  const [approvingMember, setApprovingMember] = useState<string | null>(null);

  // Create stable connection instance using useMemo
  const connection = React.useMemo(
    () => new Connection(HARDCODED_RPC_URL, {
      commitment: "confirmed",
      httpHeaders: HARDCODED_RPC_HEADERS,
    } as any),
    []
  );

  const loadApprovalStatus = React.useCallback(async () => {
    if (!isOpen) return;
    
    setLoading(true);
    try {
      // Fetch multisig account
      const multisigAccount = await multisig.accounts.Multisig.fromAccountAddress(
        connection,
        new PublicKey(multisigPda)
      );

      // Fetch proposal to see who has approved
      const proposalPda = multisig.getProposalPda({
        multisigPda: new PublicKey(multisigPda),
        transactionIndex: BigInt(transactionIndex),
        programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
      })[0];

      let approvedMembers: string[] = [];
      try {
        const proposal = await multisig.accounts.Proposal.fromAccountAddress(
          connection,
          proposalPda
        );
        approvedMembers = proposal.approved.map((pk) => pk.toBase58());
        setProposalStatus(Object.keys(proposal.status)[0]);
        console.log("✅ Loaded approval status:", { approvedMembers, status: Object.keys(proposal.status)[0] });
      } catch (error) {
        console.log("Proposal not yet created");
        setProposalStatus("None");
      }

      // Get current wallet address once to avoid re-computation
      const currentWalletAddress = publicKey?.toBase58();

      // Fetch balances for all members
      const balancePromises = multisigAccount.members.map(member => 
        connection.getBalance(member.key).catch(() => 0)
      );
      const balances = await Promise.all(balancePromises);

      // Map members with approval status and balance
      const membersList: Member[] = multisigAccount.members.map((member, index) => {
        const memberAddress = member.key.toBase58();
        return {
          address: memberAddress,
          hasApproved: approvedMembers.includes(memberAddress),
          isCurrentWallet: currentWalletAddress === memberAddress,
          balance: balances[index],
        };
      });

      setMembers(membersList);
      setTotalApprovals(approvedMembers.length);
      
      // Set current step to first unapproved member
      const firstUnapprovedIndex = membersList.findIndex(m => !m.hasApproved);
      setCurrentStep(firstUnapprovedIndex >= 0 ? firstUnapprovedIndex : membersList.length);
    } catch (error) {
      console.error("Error loading approval status:", error);
    } finally {
      setLoading(false);
    }
  }, [isOpen, multisigPda, transactionIndex, programId, connection, publicKey]);

  // Only load when modal first opens
  useEffect(() => {
    if (isOpen) {
      console.log("📂 Modal opened - loading approval status");
      loadApprovalStatus();
    }
  }, [isOpen, loadApprovalStatus]);

  const handleSwitchWallet = async (targetAddress: string) => {
    try {
      toast.info("Please disconnect your current wallet first, then connect with the required wallet.");
      await disconnect();
      walletModal.setVisible(true);
    } catch (error) {
      console.error("Error switching wallet:", error);
      toast.error("Failed to switch wallet");
    }
  };

  const handleApprove = async () => {
    if (!wallet.publicKey || !wallet.sendTransaction) return;

    setIsApproving(true);
    setApprovingMember(wallet.publicKey.toBase58());
    try {
      // Check wallet balance first
      const balance = await connection.getBalance(wallet.publicKey);
      const minRequired = 0.01 * 1000000000; // 0.01 SOL in lamports
      
      if (balance < minRequired) {
        toast.error(
          <div className="flex flex-col gap-1">
            <span>⚠️ Insufficient SOL in your wallet</span>
            <span className="text-xs">Your wallet: {wallet.publicKey.toBase58().slice(0,4)}...{wallet.publicKey.toBase58().slice(-4)}</span>
            <span className="text-xs">Balance: {(balance / 1000000000).toFixed(4)} SOL</span>
            <span className="text-xs text-orange-400">Need at least 0.01 SOL for transaction fees</span>
          </div>,
          { id: "approval", duration: 8000 }
        );
        setIsApproving(false);
        setApprovingMember(null);
        return;
      }

      const bigIntTransactionIndex = BigInt(transactionIndex);
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

      // Add approve instruction
      const approveProposalInstruction = multisig.instructions.proposalApprove({
        multisigPda: new PublicKey(multisigPda),
        member: wallet.publicKey,
        transactionIndex: bigIntTransactionIndex,
        programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
      });
      instructions.push(approveProposalInstruction);

      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      // Create versioned transaction
      const message = new TransactionMessage({
        instructions: instructions,
        payerKey: wallet.publicKey,
        recentBlockhash: blockhash,
      }).compileToV0Message();

      const transaction = new VersionedTransaction(message);

      const signature = await wallet.sendTransaction(transaction, connection, {
        skipPreflight: false,
        maxRetries: 3,
      });

      toast.loading("Confirming approval...", { id: "approval" });

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      // Track successful approval
      trackTransactionApproved('multisig_approval');
      trackUserAction('transaction_approved', { 
        transactionIndex, 
        multisigAddress: multisigPda 
      });

      // Show success with clickable Solscan link
      toast.success(
        <div className="flex flex-col gap-1">
          <span>Approval confirmed! 🎉</span>
          <a 
            href={`https://solscan.io/tx/${signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-400 hover:text-orange-300 underline text-xs"
          >
            View on Solscan →
          </a>
        </div>,
        { id: "approval", duration: 10000 }
      );
      setApprovingMember(null);
      
      // Reload approval status
      const loadApprovalStatus = async () => {
        try {
          const multisigAccount = await multisig.accounts.Multisig.fromAccountAddress(
            connection,
            new PublicKey(multisigPda)
          );

          const proposalPda = multisig.getProposalPda({
            multisigPda: new PublicKey(multisigPda),
            transactionIndex: BigInt(transactionIndex),
            programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
          })[0];

          let approvedMembers: string[] = [];
          try {
            const proposal = await multisig.accounts.Proposal.fromAccountAddress(
              connection,
              proposalPda
            );
            approvedMembers = proposal.approved.map((pk) => pk.toBase58());
            setProposalStatus(Object.keys(proposal.status)[0]);
          } catch (error) {
            setProposalStatus("None");
          }

          const membersList: Member[] = multisigAccount.members.map((member) => {
            const memberAddress = member.key.toBase58();
            return {
              address: memberAddress,
              hasApproved: approvedMembers.includes(memberAddress),
              isCurrentWallet: publicKey?.toBase58() === memberAddress,
            };
          });

          setMembers(membersList);
          setTotalApprovals(approvedMembers.length);
        } catch (error) {
          console.error("Error reloading approval status:", error);
        }
      };
      
      await loadApprovalStatus();
    } catch (error: any) {
      console.error("Error approving:", error);
      toast.error(`Failed to approve: ${error.message}`, { id: "approval" });
      setApprovingMember(null);
    } finally {
      setIsApproving(false);
    }
  };

  const progress = (totalApprovals / threshold) * 100;
  const isComplete = totalApprovals >= threshold;
  const currentMemberHasApproved = members.find(m => m.isCurrentWallet)?.hasApproved || false;
  const canApprove = publicKey && !currentMemberHasApproved && !isComplete;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Users className="w-6 h-6 text-orange-500" />
                Multi-Signature Approval Flow
              </DialogTitle>
              <DialogDescription>
                This transaction requires {threshold} out of {members.length} approvals
                <span className="text-xs text-gray-500 block mt-1">
                  Click Refresh to check for updates
                </span>
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadApprovalStatus()}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-white font-semibold">
                {totalApprovals} / {threshold} approved
              </span>
            </div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
              Approval Steps
            </h3>
            <div className="space-y-2">
              <AnimatePresence mode="wait">
                {members.map((member, index) => (
                  <motion.div
                    key={member.address}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      if (!member.hasApproved && !member.isCurrentWallet) {
                        handleSwitchWallet(member.address);
                      }
                    }}
                    className={`
                      flex items-center gap-4 p-4 rounded-lg border transition-all
                      ${
                        member.hasApproved
                          ? "bg-green-500/10 border-green-500/30"
                          : member.isCurrentWallet && !member.hasApproved
                          ? "bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/20"
                          : "bg-zinc-800/50 border-zinc-700 cursor-pointer hover:bg-zinc-800 hover:border-zinc-600"
                      }
                      ${approvingMember === member.address ? "ring-2 ring-orange-500" : ""}
                    `}
                  >
                    {/* Status Icon with Circular Progress */}
                    <div className="flex-shrink-0 relative">
                      {member.hasApproved ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center"
                        >
                          <Check className="w-6 h-6 text-white" />
                        </motion.div>
                      ) : approvingMember === member.address ? (
                        <div className="relative w-12 h-12">
                          {/* Spinning circle progress indicator */}
                          <svg className="w-12 h-12 -rotate-90">
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="none"
                              className="text-zinc-700"
                            />
                            <motion.circle
                              cx="24"
                              cy="24"
                              r="20"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="none"
                              className="text-orange-500"
                              strokeLinecap="round"
                              initial={{ strokeDasharray: "0 125.6" }}
                              animate={{ strokeDasharray: ["0 125.6", "125.6 0"] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <RefreshCw className="w-5 h-5 text-orange-500 animate-spin" />
                          </div>
                        </div>
                      ) : member.isCurrentWallet ? (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center"
                        >
                          <Wallet className="w-5 h-5 text-white" />
                        </motion.div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center hover:bg-zinc-600 transition-colors">
                          <Clock className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Member Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono text-white truncate">
                          {member.address.slice(0, 4)}...{member.address.slice(-4)}
                        </p>
                        {member.isCurrentWallet && (
                          <span className="px-2 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs text-gray-400">
                          {approvingMember === member.address
                            ? "Signing transaction..."
                            : member.hasApproved
                            ? "Approved ✓"
                            : member.isCurrentWallet
                            ? "Ready to approve - Click below"
                            : "Click to switch wallet & approve"}
                        </p>
                        {member.balance !== undefined && (
                          <p className={`text-xs ${
                            member.balance < 0.01 * 1000000000 
                              ? "text-red-400 font-semibold" 
                              : "text-gray-500"
                          }`}>
                            Balance: {(member.balance / 1000000000).toFixed(4)} SOL
                            {member.balance < 0.01 * 1000000000 && " ⚠️ Need 0.01 SOL"}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Arrow */}
                    {member.isCurrentWallet && !member.hasApproved && (
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <ArrowRight className="w-5 h-5 text-orange-500" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Important Info Box */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-xs text-yellow-200">
              <strong>💰 Important:</strong> Each member wallet needs ~0.01 SOL for transaction fees when approving.
              This is separate from the vault funds.
            </p>
          </div>

          {/* Instructions */}
          {!isComplete && !isApproving && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-200">
                {members.find((m) => m.isCurrentWallet && !m.hasApproved) ? (
                  <>
                    <strong>✨ Your turn!</strong> Click &quot;Approve Now&quot; below to sign.
                  </>
                ) : (
                  <>
                    <strong>💡 Switch wallets:</strong> Click on any member above to connect as that wallet and approve.
                  </>
                )}
              </p>
            </div>
          )}
          
          {/* Signing in progress */}
          {isApproving && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-orange-500 animate-spin" />
                <p className="text-sm text-orange-200">
                  <strong>Signing transaction...</strong> Please confirm in your wallet.
                </p>
              </div>
            </motion.div>
          )}

          {/* Success Message */}
          {isComplete && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
            >
              <p className="text-sm text-green-200 text-center font-semibold">
                🎉 All required approvals received! Transaction is ready to execute.
              </p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            {canApprove && (
              <Button
                onClick={handleApprove}
                disabled={isApproving}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                {isApproving ? "Approving..." : "Approve Now"}
              </Button>
            )}
            {isComplete && (
              <Button
                onClick={() => {
                  onApprovalComplete();
                  onClose();
                }}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                Ready to Execute →
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
