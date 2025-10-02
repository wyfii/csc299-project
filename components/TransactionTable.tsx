"use client";
import * as multisig from "nova-multisig-sdk";
import ApproveButton from "./ApproveButton";
import ExecuteButton from "./ExecuteButton";
import RejectButton from "./RejectButton";
import Link from "next/link";
import { CheckCircle, Clock, XCircle, CheckCheck, Ban, FileText, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface ActionButtonsProps {
  rpcUrl: string;
  multisigPda: string;
  transactionIndex: number;
  proposalStatus: string;
  programId: string;
}

export default function TransactionTable({
  multisigPda,
  rpcUrl,
  transactions,
  programId,
}: {
  multisigPda: string;
  rpcUrl: string;
  transactions: {
    transactionPda: string;
    proposal: multisig.generated.Proposal | null;
    index: bigint;
  }[];
  programId?: string;
}) {
  if (transactions.length === 0) {
    return (
      <div className="p-12 text-center">
        <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction, index) => {
        const status = transaction.proposal?.status.__kind || "None";
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="
              group relative
              bg-gray-900/30
              border-l-2 border-trench-orange/40
              backdrop-blur-sm p-4
              transition-all duration-200
              hover:bg-gray-900/50 hover:border-trench-orange
            "
            style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
          >
            {/* Transaction Number Badge */}
            <div 
              className="
                absolute -left-3 top-4
                w-10 h-10 flex items-center justify-center
                bg-black border-2 border-trench-orange
                font-mono text-sm text-trench-orange font-bold
              "
              style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }}
            >
              #{Number(transaction.index)}
            </div>

            {/* Content - Horizontal Layout */}
            <div className="flex items-center justify-between ml-7">
              <div className="flex items-center gap-4 flex-1">
                <StatusBadge status={status} />
                
                <Link
                  href={createSolanaExplorerUrl(transaction.transactionPda, rpcUrl!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-gray-400 hover:text-trench-orange transition-colors flex items-center gap-1"
                >
                  {transaction.transactionPda.slice(0, 8)}...{transaction.transactionPda.slice(-8)}
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <ActionButtons
                  rpcUrl={rpcUrl!}
                  multisigPda={multisigPda!}
                  transactionIndex={Number(transaction.index)}
                  proposalStatus={status}
                  programId={programId ? programId : multisig.PROGRAM_ID.toBase58()}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Approved":
        return {
          icon: CheckCircle,
          text: "Ready",
          color: "text-trench-orange border-trench-orange/30 bg-trench-orange/10",
        };
      case "Executed":
        return {
          icon: CheckCheck,
          text: "Done",
          color: "text-gray-500 border-gray-500/30 bg-gray-500/10",
        };
      case "Active":
        return {
          icon: Clock,
          text: "Pending",
          color: "text-gray-400 border-gray-400/30 bg-gray-400/10",
        };
      case "Rejected":
        return {
          icon: XCircle,
          text: "Rejected",
          color: "text-red-400 border-red-400/30 bg-red-400/10",
        };
      case "Cancelled":
        return {
          icon: Ban,
          text: "Cancelled",
          color: "text-gray-500 border-gray-500/30 bg-gray-500/10",
        };
      default:
        return {
          icon: Clock,
          text: "Draft",
          color: "text-gray-500 border-gray-500/30 bg-gray-500/10",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 border font-button uppercase tracking-wider text-[10px] ${config.color}`}
      style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }}
    >
      <Icon className="w-2.5 h-2.5" />
      {config.text}
    </div>
  );
}

function ActionButtons({
  rpcUrl,
  multisigPda,
  transactionIndex,
  proposalStatus,
  programId,
}: ActionButtonsProps) {
  return (
    <>
      <ApproveButton
        rpcUrl={rpcUrl}
        multisigPda={multisigPda}
        transactionIndex={transactionIndex}
        proposalStatus={proposalStatus}
        programId={programId}
      />
      <RejectButton
        rpcUrl={rpcUrl}
        multisigPda={multisigPda}
        transactionIndex={transactionIndex}
        proposalStatus={proposalStatus}
        programId={programId}
      />
      <ExecuteButton
        rpcUrl={rpcUrl}
        multisigPda={multisigPda}
        transactionIndex={transactionIndex}
        proposalStatus={proposalStatus}
        programId={programId}
      />
    </>
  );
}

function createSolanaExplorerUrl(publicKey: string, rpcUrl: string): string {
  const baseUrl = "https://solscan.io/account/";
  const clusterQuery = "?cluster=custom&customUrl=";
  const encodedRpcUrl = encodeURIComponent(rpcUrl);

  return `${baseUrl}${publicKey}${clusterQuery}${encodedRpcUrl}`;
}
