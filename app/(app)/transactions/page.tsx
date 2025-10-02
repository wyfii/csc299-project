import * as multisig from "nova-multisig-sdk";
import { headers } from "next/headers";
import { Connection, PublicKey } from "@solana/web3.js";
import { HARDCODED_RPC_HEADERS, HARDCODED_RPC_URL, OFFICIAL_PROGRAM_ID } from "@/lib/utils";
import { Suspense } from "react";
import CreateTransaction from "@/components/CreateTransactionButton";
import TransactionTable from "@/components/TransactionTable";
import { getMultisigFromFirestore } from "@/lib/getMultisigFromFirestore";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

// Add caching to reduce RPC calls
export const revalidate = 30; // Cache for 30 seconds
export const dynamic = 'force-dynamic';

const TRANSACTIONS_PER_PAGE = 10;

interface ActionButtonsProps {
  rpcUrl: string;
  multisigPda: string;
  transactionIndex: number;
  proposalStatus: string;
  programId: PublicKey;
}

export default async function TransactionsPage({
  params,
  searchParams,
}: {
  params: {};
  searchParams: { page: string };
}) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const connection = new Connection(HARDCODED_RPC_URL, {
    commitment: "confirmed",
    httpHeaders: HARDCODED_RPC_HEADERS,
  } as any);
  
  // Get wallet address and query Firestore for multisig
  const walletAddress = headers().get("x-wallet");
  let multisigCookie: string | null = null;
  if (walletAddress) {
    multisigCookie = await getMultisigFromFirestore(walletAddress);
  }
  
  if (!multisigCookie) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white uppercase tracking-wider mb-6">
          Transactions
        </h1>
        <div className="bg-gray-900/30 border border-gray-800 p-8 text-center"
             style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
          <p className="text-gray-400">No multisig found. Please create one first.</p>
        </div>
      </div>
    );
  }

  let multisigPda: PublicKey;
  try {
    multisigPda = new PublicKey(multisigCookie);
  } catch {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white uppercase tracking-wider mb-6">
          Transactions
        </h1>
        <div className="bg-gray-900/30 border border-gray-800 p-8 text-center"
             style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
          <p className="text-gray-400">Invalid multisig address</p>
        </div>
      </div>
    );
  }

  const vaultIndex = Number(headers().get("x-vault-index")) || 0;
  let programId: PublicKey;
  try {
    programId = new PublicKey(OFFICIAL_PROGRAM_ID);
  } catch {
    programId = multisig.PROGRAM_ID;
  }

  let multisigInfo: multisig.generated.Multisig;
  try {
    multisigInfo = await multisig.accounts.Multisig.fromAccountAddress(
      connection,
      multisigPda
    );
  } catch (e) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white uppercase tracking-wider mb-6">
          Transactions
        </h1>
        <div className="bg-gray-900/30 border border-gray-800 p-8 text-center"
             style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
          <p className="text-gray-400">
            Multisig not found at {multisigCookie}. Check the multisig address and try again.
          </p>
        </div>
      </div>
    );
  }

  const totalTransactions = Number(multisigInfo.transactionIndex);
  const totalPages = Math.ceil(totalTransactions / TRANSACTIONS_PER_PAGE);

  const startIndex = totalTransactions - (page - 1) * TRANSACTIONS_PER_PAGE;
  const endIndex = Math.max(startIndex - TRANSACTIONS_PER_PAGE + 1, 1);

  let latestTransactions: Awaited<ReturnType<typeof fetchTransactionData>>[] = [];
  try {
    latestTransactions = await Promise.all(
      Array.from({ length: startIndex - endIndex + 1 }, (_, i) => {
        const index = BigInt(startIndex - i);
        return fetchTransactionData(connection, multisigPda, index, programId);
      })
    );
  } catch (e) {
    latestTransactions = [] as any;
  }

  const transactions = latestTransactions.map((transaction) => {
    return {
      ...transaction,
      transactionPda: transaction.transactionPda[0].toBase58(),
    };
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white uppercase tracking-wider">
          Transactions
        </h1>
        <p className="text-gray-400 mt-2">
          {totalTransactions > 0 ? `${totalTransactions} total transactions` : 'No transactions yet'}
        </p>
      </div>

      {/* Transactions List */}
      <Suspense fallback={
        <div className="bg-gray-900/30 border border-gray-800 p-12 text-center"
             style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
          <Clock className="w-8 h-8 text-gray-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400">Loading transactions...</p>
        </div>
      }>
        {transactions.length > 0 ? (
          <div className="relative p-[2px]"
               style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
            <div className="absolute inset-0 bg-gray-800" />
            <div 
              className="relative bg-gray-900/50 overflow-hidden"
              style={{ clipPath: 'polygon(10px 0, calc(100% - 2px) 0, calc(100% - 2px) calc(100% - 10px), calc(100% - 10px) calc(100% - 2px), 2px calc(100% - 2px), 2px 10px)' }}
            >
              <TransactionTable
                multisigPda={multisigCookie}
                rpcUrl={HARDCODED_RPC_URL}
                transactions={transactions}
                programId={OFFICIAL_PROGRAM_ID}
              />
            </div>
          </div>
        ) : (
          <div className="bg-gray-900/30 border border-gray-800 p-12 text-center"
               style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No transactions yet</h3>
            <p className="text-gray-400">Create your first transaction to get started</p>
          </div>
        )}
      </Suspense>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          {page > 1 && (
            <Link href={`/transactions?page=${page - 1}`}>
              <button
                className="
                  px-6 py-3
                  bg-gray-900 border border-gray-800
                  font-button uppercase tracking-wider text-xs
                  text-gray-300 hover:text-white hover:border-gray-700
                  transition-all duration-200
                  flex items-center gap-2
                "
                style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
            </Link>
          )}

          <span className="text-sm text-gray-500 font-mono">
            Page {page} of {totalPages}
          </span>

          {page < totalPages && (
            <Link href={`/transactions?page=${page + 1}`}>
              <button
                className="
                  px-6 py-3
                  bg-gray-900 border border-gray-800
                  font-button uppercase tracking-wider text-xs
                  text-gray-300 hover:text-white hover:border-gray-700
                  transition-all duration-200
                  flex items-center gap-2
                "
                style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

async function fetchTransactionData(
  connection: Connection,
  multisigPda: PublicKey,
  index: bigint,
  programId: PublicKey
) {
  const transactionPda = multisig.getTransactionPda({
    multisigPda,
    index,
    programId,
  });
  const proposalPda = multisig.getProposalPda({
    multisigPda,
    transactionIndex: index,
    programId,
  });

  let proposal;
  try {
    proposal = await multisig.accounts.Proposal.fromAccountAddress(
      connection,
      proposalPda[0]
    );
  } catch (error) {
    proposal = null;
  }

  return { transactionPda, proposal, index };
}
