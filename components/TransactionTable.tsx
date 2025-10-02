import * as multisig from "nova-multisig-sdk";
import ApproveButton from "./ApproveButton";
import ExecuteButton from "./ExecuteButton";
import RejectButton from "./RejectButton";
import Link from "next/link";
import { CheckCircle, Clock, XCircle, CheckCheck, Ban } from "lucide-react";

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
    <div className="divide-y divide-gray-800">
      {transactions.map((transaction, index) => {
        const status = transaction.proposal?.status.__kind || "None";
        return (
          <div
            key={index}
            className="p-4 hover:bg-gray-900/30 transition-all duration-200"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Left side - Transaction info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <div 
                    className="flex items-center justify-center w-10 h-10 bg-gray-900 border border-gray-800 font-mono text-sm text-trench-orange font-bold"
                    style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
                  >
                    #{Number(transaction.index)}
                  </div>
                  
                  <StatusBadge status={status} />
                </div>
                
                <Link
                  href={createSolanaExplorerUrl(
                    transaction.transactionPda,
                    rpcUrl!
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block font-mono text-xs text-gray-400 hover:text-trench-orange transition-colors"
                >
                  {transaction.transactionPda.slice(0, 16)}...{transaction.transactionPda.slice(-16)}
                </Link>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <ActionButtons
                  rpcUrl={rpcUrl!}
                  multisigPda={multisigPda!}
                  transactionIndex={Number(transaction.index)}
                  proposalStatus={status}
                  programId={
                    programId ? programId : multisig.PROGRAM_ID.toBase58()
                  }
                />
              </div>
            </div>
          </div>
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
          text: "Approved",
          color: "text-green-400 border-green-400/30 bg-green-400/10",
        };
      case "Executed":
        return {
          icon: CheckCheck,
          text: "Executed",
          color: "text-green-500 border-green-500/30 bg-green-500/10",
        };
      case "Active":
        return {
          icon: Clock,
          text: "Active",
          color: "text-trench-orange border-trench-orange/30 bg-trench-orange/10",
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
          color: "text-gray-400 border-gray-400/30 bg-gray-400/10",
        };
      default:
        return {
          icon: Clock,
          text: "Draft",
          color: "text-gray-400 border-gray-400/30 bg-gray-400/10",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 border font-button uppercase tracking-wider text-xs ${config.color}`}
      style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
    >
      <Icon className="w-3 h-3" />
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
