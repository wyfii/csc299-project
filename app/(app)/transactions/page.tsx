import * as multisig from "nova-multisig-sdk";
import { cookies, headers } from "next/headers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { HARDCODED_RPC_HEADERS, HARDCODED_RPC_URL, OFFICIAL_PROGRAM_ID } from "@/lib/utils";
import {
  Table,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Suspense } from "react";
import CreateTransaction from "@/components/CreateTransactionButton";
import TransactionTable from "@/components/TransactionTable";
import { getMultisigFromFirestore } from "@/lib/getMultisigFromFirestore";

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
  const rpcUrl = headers().get("x-rpc-url");
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
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-medium text-white">Transactions</h1>
        </div>
      </div>
    );
  }
  let multisigPda: PublicKey;
  try {
    multisigPda = new PublicKey(multisigCookie);
  } catch {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-medium text-white">Transactions</h1>
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
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-medium text-white">Transactions</h1>
        </div>
        <p className="text-sm text-slate-600">
          Multisig not found at {multisigCookie}. Check the multisig address,
          selected program ID, and RPC/cluster, then try again.
        </p>
      </div>
    );
  }

  const totalTransactions = Number(multisigInfo.transactionIndex);
  const totalPages = Math.ceil(totalTransactions / TRANSACTIONS_PER_PAGE);

  /*
  if (page > totalPages) {
    redirect(`/transactions?page=0`);
  }
  */

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
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-medium text-white">Transactions</h1>
        <CreateTransaction
          rpcUrl={HARDCODED_RPC_URL}
          multisigPda={multisigCookie}
          vaultIndex={vaultIndex}
          programId={OFFICIAL_PROGRAM_ID}
        />
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <Table>
          <TableCaption>A list of your recent transactions.</TableCaption>
          <TableCaption>
            Page: {totalPages > 0 ? page + 1 : 0} of {totalPages}
          </TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead>Index</TableHead>
              <TableHead>Public Key</TableHead>
              <TableHead>Proposal Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <Suspense fallback={<div>Loading...</div>}>
            <TransactionTable
              multisigPda={multisigCookie}
              rpcUrl={HARDCODED_RPC_URL}
              transactions={transactions}
              programId={OFFICIAL_PROGRAM_ID}
            />
          </Suspense>
        </Table>
      </Suspense>

      <Pagination>
        <PaginationContent>
          {page > 1 && (
            <PaginationItem>
              <PaginationPrevious href={`/transactions?page=${page - 1}`} />
            </PaginationItem>
          )}
          {page < totalPages && (
            <PaginationItem>
              <PaginationNext href={`/transactions?page=${page + 1}`} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
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
