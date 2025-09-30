'use client';
import {
  AddressLookupTableAccount,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  clusterApiUrl,
} from '@solana/web3.js';
import { Button } from './ui/button';
import * as multisig from 'nova-multisig-sdk';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Dialog, DialogDescription, DialogHeader } from './ui/dialog';
import { DialogTrigger } from './ui/dialog';
import { DialogContent, DialogTitle } from './ui/dialog';
import { useState } from 'react';
import { range, HARDCODED_RPC_HEADERS, HARDCODED_RPC_URL } from '@/lib/utils';

type WithALT = {
  instruction: TransactionInstruction;
  lookupTableAccounts: AddressLookupTableAccount[];
};

type ExecuteButtonProps = {
  rpcUrl: string;
  multisigPda: string;
  transactionIndex: number;
  proposalStatus: string;
  programId: string;
};

const ExecuteButton = ({
  rpcUrl,
  multisigPda,
  transactionIndex,
  proposalStatus,
  programId,
}: ExecuteButtonProps) => {
  const wallet = useWallet();
  const walletModal = useWalletModal();
  const router = useRouter();
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Optimal defaults - hidden from users
  const PRIORITY_FEE_MICROLAMPORTS = 10000; // 0.01 SOL priority (good for most transactions)
  const COMPUTE_UNIT_LIMIT = 400000; // Generous limit for complex transactions

  const isTransactionReady = proposalStatus === 'Approved';
  const connection = new Connection(HARDCODED_RPC_URL, {
    commitment: 'confirmed',
    httpHeaders: HARDCODED_RPC_HEADERS,
  } as any);

  const executeTransaction = async () => {
    if (!wallet.publicKey) {
      walletModal.setVisible(true);
      return;
    }
    const member = wallet.publicKey;
    if (!wallet.signAllTransactions) return;
    
    setIsExecuting(true);
    let lastSignature = '';
    
    try {
      const bigIntTransactionIndex = BigInt(transactionIndex);

      if (!isTransactionReady) {
        toast.error('Proposal has not reached threshold.');
        setIsExecuting(false);
        return;
      }

      // Check member wallet balance
      const memberBalance = await connection.getBalance(member);
      console.log('💰 Member Wallet Balance:', {
        wallet: member.toBase58(),
        balance: memberBalance / 1000000000,
        balanceLamports: memberBalance,
      });

      // Get vault address and check its balance
      const vaultPda = multisig.getVaultPda({
        multisigPda: new PublicKey(multisigPda),
        index: 0, // Assuming vault index 0
        programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
      })[0];
      
      const vaultBalance = await connection.getBalance(vaultPda);
      console.log('🏦 Vault Balance:', {
        vault: vaultPda.toBase58(),
        balance: vaultBalance / 1000000000,
        balanceLamports: vaultBalance,
      });

      console.log('📋 Execution Details:', {
        multisigPda: multisigPda,
        member: member.toBase58(),
        transactionIndex: bigIntTransactionIndex.toString(),
        programId: programId ? programId : multisig.PROGRAM_ID.toBase58(),
      });

      const [transactionPda] = multisig.getTransactionPda({
        multisigPda: new PublicKey(multisigPda),
        index: bigIntTransactionIndex,
        programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
      });

      let txData;
      let txType;
      try {
        await multisig.accounts.VaultTransaction.fromAccountAddress(connection, transactionPda);
        txType = 'vault';
      } catch (error) {
        try {
          await multisig.accounts.ConfigTransaction.fromAccountAddress(connection, transactionPda);
          txType = 'config';
        } catch (e) {
          txData = await multisig.accounts.Batch.fromAccountAddress(connection, transactionPda);
          txType = 'batch';
        }
      }

      const transactions: VersionedTransaction[] = [];

      // Set optimal priority fee and compute budget automatically
      const priorityFeeInstruction = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: PRIORITY_FEE_MICROLAMPORTS,
      });
      const computeUnitInstruction = ComputeBudgetProgram.setComputeUnitLimit({
        units: COMPUTE_UNIT_LIMIT,
      });

      const blockhash = (await connection.getLatestBlockhash()).blockhash;

      if (txType == 'vault') {
        const resp = await multisig.instructions.vaultTransactionExecute({
          multisigPda: new PublicKey(multisigPda),
          connection,
          member,
          transactionIndex: bigIntTransactionIndex,
          programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
        });
        transactions.push(
          new VersionedTransaction(
            new TransactionMessage({
              instructions: [priorityFeeInstruction, computeUnitInstruction, resp.instruction],
              payerKey: member,
              recentBlockhash: blockhash,
            }).compileToV0Message(resp.lookupTableAccounts)
          )
        );
      } else if (txType == 'config') {
        const executeIx = multisig.instructions.configTransactionExecute({
          multisigPda: new PublicKey(multisigPda),
          member,
          rentPayer: member,
          transactionIndex: bigIntTransactionIndex,
          programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
        });
        transactions.push(
          new VersionedTransaction(
            new TransactionMessage({
              instructions: [priorityFeeInstruction, computeUnitInstruction, executeIx],
              payerKey: member,
              recentBlockhash: blockhash,
            }).compileToV0Message()
          )
        );
      } else if (txType == 'batch' && txData) {
        const executedBatchIndex = txData.executedTransactionIndex;
        const batchSize = txData.size;

        if (executedBatchIndex === undefined || batchSize === undefined) {
          throw new Error(
            "executedBatchIndex or batchSize is undefined and can't execute the transaction"
          );
        }

        transactions.push(
          ...(await Promise.all(
            range(executedBatchIndex + 1, batchSize).map(async (batchIndex) => {
              const { instruction: transactionExecuteIx, lookupTableAccounts } =
                await multisig.instructions.batchExecuteTransaction({
                  connection,
                  member,
                  batchIndex: bigIntTransactionIndex,
                  transactionIndex: batchIndex,
                  multisigPda: new PublicKey(multisigPda),
                  programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
                });

              const message = new TransactionMessage({
                payerKey: member,
                recentBlockhash: blockhash,
                instructions: [priorityFeeInstruction, computeUnitInstruction, transactionExecuteIx],
              }).compileToV0Message(lookupTableAccounts);

              return new VersionedTransaction(message);
            })
          ))
        );
      }

      console.log(`📦 Built ${transactions.length} transaction(s) to sign`);
      
      // Simulate first to catch errors before signing
      for (let i = 0; i < transactions.length; i++) {
        console.log(`🧪 Simulating transaction ${i + 1}/${transactions.length}...`);
        try {
          const simulation = await connection.simulateTransaction(transactions[i]);
          console.log(`✅ Simulation ${i + 1} result:`, {
            err: simulation.value.err,
            logs: simulation.value.logs,
            unitsConsumed: simulation.value.unitsConsumed,
          });
          
          if (simulation.value.err) {
            console.error(`❌ Simulation ${i + 1} failed:`, simulation.value.err);
            console.error('Full simulation logs:', simulation.value.logs);
            throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
          }
        } catch (simError: any) {
          console.error('❌ Simulation error:', simError);
          throw simError;
        }
      }

      console.log('✅ All simulations passed! Requesting signatures...');
      const signedTransactions = await wallet.signAllTransactions(transactions);

      console.log('✅ Transactions signed! Sending to network...');
      for (let i = 0; i < signedTransactions.length; i++) {
        const signedTx = signedTransactions[i];
        console.log(`📤 Sending transaction ${i + 1}/${signedTransactions.length}...`);
        
        const signature = await connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: true,
        });
        lastSignature = signature;
        console.log(`✅ Transaction ${i + 1} signature:`, signature);
        
        toast.loading(`Confirming execution (${i + 1}/${signedTransactions.length})...`, {
          id: 'transaction',
        });
        
        await connection.getSignatureStatuses([signature]);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      
      // Show success with clickable Solscan link
      toast.success(
        <div className="flex flex-col gap-1">
          <span>Transaction executed successfully! 🎉</span>
          <a 
            href={`https://solscan.io/tx/${lastSignature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-400 hover:text-orange-300 underline text-xs"
          >
            View on Solscan →
          </a>
        </div>,
        { id: 'transaction', duration: 10000 }
      );
      router.refresh();
    } catch (error: any) {
      console.error('❌ EXECUTION ERROR:', error);
      console.error('Error details:', {
        message: error.message,
        logs: error.logs,
        code: error.code,
        data: error.data,
      });
      
      // Parse error message from simulation logs
      let errorMessage = error.message || 'Unknown error';
      const errorStr = JSON.stringify(error);
      
      if (errorStr.includes('6005') || errorStr.includes('not a member')) {
        errorMessage = 'You are NOT a member of this multisig! You cannot execute transactions on it.';
        toast.error(
          <div className="flex flex-col gap-1">
            <span>❌ {errorMessage}</span>
            <span className="text-xs">Connected wallet: {member.toBase58().slice(0,4)}...{member.toBase58().slice(-4)}</span>
            <span className="text-xs">Multisig: {multisigPda.slice(0,4)}...{multisigPda.slice(-4)}</span>
            <span className="text-xs text-orange-400">Switch to a wallet that&apos;s a member of this multisig</span>
          </div>,
          { id: 'transaction', duration: 15000 }
        );
      } else if (errorMessage.includes('insufficient')) {
        toast.error(
          <div className="flex flex-col gap-1">
            <span>❌ Insufficient funds in vault!</span>
            <span className="text-xs">Check the vault balance above</span>
          </div>,
          { id: 'transaction', duration: 10000 }
        );
      } else {
        toast.error(
          <div className="flex flex-col gap-1">
            <span>Failed to execute: {errorMessage}</span>
            <span className="text-xs text-gray-400">Check console for full logs</span>
          </div>,
          { id: 'transaction', duration: 10000 }
        );
      }
    } finally {
      setIsExecuting(false);
    }
  };
  return (
    <Dialog>
      <DialogTrigger
        disabled={!isTransactionReady}
        className="mr-2 h-10 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Execute
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Execute Transaction</DialogTitle>
          <DialogDescription>
            All required approvals have been received. Click below to execute this transaction.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
            <p className="text-sm text-gray-300">
              This transaction is ready to be executed on-chain. The network will process it with:
            </p>
            <ul className="text-xs text-gray-400 mt-2 space-y-1 list-disc list-inside">
              <li>Optimal priority fee for fast confirmation</li>
              <li>Sufficient compute budget for complex operations</li>
            </ul>
          </div>

          <Button
            disabled={!isTransactionReady || isExecuting}
            onClick={executeTransaction}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-6"
          >
            {isExecuting ? 'Executing...' : 'Execute Transaction'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExecuteButton;
