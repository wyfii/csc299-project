"use client";
import React from "react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as multisig from "nova-multisig-sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { HARDCODED_RPC_HEADERS, HARDCODED_RPC_URL } from "@/lib/utils";

type AdminPayoutPanelProps = {
  members: string[];
  multisigPda: string;
  vaultIndex: number;
  programId?: string;
  vaultBalanceSOL: number;
};

export default function AdminPayoutPanel({ members, multisigPda, vaultIndex, programId, vaultBalanceSOL }: AdminPayoutPanelProps) {
  const wallet = useWallet();
  const [perMemberSOL, setPerMemberSOL] = useState<number>(0.001);
  const [minPerMemberSOL, setMinPerMemberSOL] = useState<number>(0);
  const [maxPerMemberSOL, setMaxPerMemberSOL] = useState<number>(0);

  const numMembers = members.length;

  const totalCostSOL = useMemo(() => {
    return parseFloat(((perMemberSOL || 0) * numMembers).toFixed(9));
  }, [perMemberSOL, numMembers]);

  const minTotalSOL = useMemo(() => parseFloat(((minPerMemberSOL || 0) * numMembers).toFixed(9)), [minPerMemberSOL, numMembers]);
  const maxTotalSOL = useMemo(() => parseFloat(((maxPerMemberSOL || 0) * numMembers).toFixed(9)), [maxPerMemberSOL, numMembers]);

  const canAfford = totalCostSOL <= vaultBalanceSOL;

  const airdrop = async () => {
    if (!wallet.publicKey) {
      toast.error("Connect your wallet to create proposal");
      return;
    }

    if (numMembers === 0) {
      toast.error("No members to pay");
      return;
    }

    if (perMemberSOL <= 0) {
      toast.error("Per-member amount must be > 0");
      return;
    }

    if (!canAfford) {
      toast.error("Total exceeds vault balance");
      return;
    }

    try {
      const connection = new Connection(HARDCODED_RPC_URL, {
        commitment: "confirmed",
        httpHeaders: HARDCODED_RPC_HEADERS,
      } as any);

      const lamportsPerMember = Math.floor(perMemberSOL * 1_000_000_000);
      if (lamportsPerMember <= 0) {
        toast.error("Per-member amount too small");
        return;
      }

      const vaultAddress = multisig
        .getVaultPda({
          index: vaultIndex,
          multisigPda: new PublicKey(multisigPda),
          programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
        })[0];

      const multisigInfo = await multisig.accounts.Multisig.fromAccountAddress(
        connection,
        new PublicKey(multisigPda)
      );

      const blockhash = (await connection.getLatestBlockhash()).blockhash;

      const transferInstructions = members.map((recipientBase58) =>
        SystemProgram.transfer({
          fromPubkey: vaultAddress,
          toPubkey: new PublicKey(recipientBase58),
          lamports: lamportsPerMember,
        })
      );

      const transferMessage = new TransactionMessage({
        instructions: transferInstructions,
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

      const wrapperMessage = new TransactionMessage({
        instructions: [multisigTransactionIx, proposalIx, approveIx],
        payerKey: wallet.publicKey,
        recentBlockhash: blockhash,
      }).compileToV0Message();

      const transaction = new VersionedTransaction(wrapperMessage);

      const signature = await wallet.sendTransaction(transaction, connection, {
        skipPreflight: true,
      });

      toast.loading("Confirming proposal...", { id: "airdrop" });
      await connection.getSignatureStatuses([signature]);
      await new Promise((r) => setTimeout(r, 1000));

      toast.success("Airdrop proposal submitted", { id: "airdrop" });
    } catch (e: any) {
      toast.error(e?.message || "Failed to create airdrop proposal");
    }
  };

  return (
    <div className="relative p-[2px]" style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
      <div className="absolute inset-0 bg-gray-800" />
      <div className="relative bg-transparent p-6" style={{ clipPath: 'polygon(10px 0, calc(100% - 2px) 0, calc(100% - 2px) calc(100% - 10px), calc(100% - 10px) calc(100% - 2px), 2px calc(100% - 2px), 2px 10px)' }}>
        <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Admin Payouts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-400">Per-member amount (SOL)</label>
            <Input type="number" step="0.000001" value={perMemberSOL} onChange={(e) => setPerMemberSOL(parseFloat(e.target.value) || 0)} className="bg-zinc-900 border-gray-800" />
          </div>
          <div>
            <label className="text-xs text-gray-400">Min per-member (SOL)</label>
            <Input type="number" step="0.000001" value={minPerMemberSOL} onChange={(e) => setMinPerMemberSOL(parseFloat(e.target.value) || 0)} className="bg-zinc-900 border-gray-800" />
          </div>
          <div>
            <label className="text-xs text-gray-400">Max per-member (SOL)</label>
            <Input type="number" step="0.000001" value={maxPerMemberSOL} onChange={(e) => setMaxPerMemberSOL(parseFloat(e.target.value) || 0)} className="bg-zinc-900 border-gray-800" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-gray-900/50 border border-gray-800">
            <div className="text-gray-400">Members</div>
            <div className="text-white font-bold">{numMembers}</div>
          </div>
          <div className="p-3 bg-gray-900/50 border border-gray-800">
            <div className="text-gray-400">Vault balance</div>
            <div className="text-white font-bold">{vaultBalanceSOL.toFixed(6)} SOL</div>
          </div>
          <div className={`p-3 bg-gray-900/50 border ${canAfford ? 'border-gray-800' : 'border-red-500/40'}`}>
            <div className="text-gray-400">Total cost</div>
            <div className={`font-bold ${canAfford ? 'text-white' : 'text-red-400'}`}>{totalCostSOL.toFixed(6)} SOL</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-gray-900/30 border border-gray-800">
            <div className="text-gray-400">Min scenario total</div>
            <div className="text-white font-bold">{minTotalSOL.toFixed(6)} SOL</div>
          </div>
          <div className="p-3 bg-gray-900/30 border border-gray-800">
            <div className="text-gray-400">Max scenario total</div>
            <div className="text-white font-bold">{maxTotalSOL.toFixed(6)} SOL</div>
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={airdrop} disabled={!wallet.publicKey || !canAfford || numMembers === 0} className="w-full md:w-auto">
            Propose Airdrop to All Members
          </Button>
        </div>
      </div>
    </div>
  );
}


