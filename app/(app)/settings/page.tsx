import AddMemberInput from "@/components/AddMemberInput";
import ChangeThresholdInput from "@/components/ChangeThresholdInput";
import RemoveMemberButton from "@/components/RemoveMemberButton";
import { Connection, PublicKey } from "@solana/web3.js";
import { HARDCODED_RPC_HEADERS, HARDCODED_RPC_URL, OFFICIAL_PROGRAM_ID } from "@/lib/utils";
import * as multisig from "nova-multisig-sdk";
import { headers } from "next/headers";
import { getMultisigFromFirestore } from "@/lib/getMultisigFromFirestore";
import { Users, Shield, UserMinus } from "lucide-react";
import AdminPayoutPanel from "@/components/AdminPayoutPanel";

// Add caching to reduce RPC calls
export const revalidate = 30; // Cache for 30 seconds
export const dynamic = 'force-dynamic';

const SettingsPage = async () => {
  const connection = new Connection(HARDCODED_RPC_URL, {
    commitment: "confirmed",
    httpHeaders: HARDCODED_RPC_HEADERS,
  } as any);
  
  // Get wallet address and optionally selected multisig from headers
  const walletAddress = headers().get("x-wallet");
  const selectedMultisig = headers().get("x-multisig");
  let multisigCookie: string | null = null;
  if (selectedMultisig) {
    multisigCookie = selectedMultisig;
  } else if (walletAddress) {
    multisigCookie = await getMultisigFromFirestore(walletAddress);
  }
  
  if (!multisigCookie) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white uppercase tracking-wider mb-6">
          Settings
        </h1>
        <div className="bg-transparent border border-gray-800 p-8 text-center"
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
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white uppercase tracking-wider mb-6">
          Settings
        </h1>
        <div className="bg-transparent border border-gray-800 p-8 text-center"
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
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white uppercase tracking-wider mb-6">
          Settings
        </h1>
        <div className="bg-transparent border border-gray-800 p-8 text-center"
             style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
          <p className="text-gray-400">
            Multisig not found at {multisigCookie}. Check the multisig address and try again.
          </p>
        </div>
      </div>
    );
  }

  // Compute vault balance to show payout affordability
  const vaultAddress = multisig.getVaultPda({
    multisigPda,
    index: vaultIndex,
    programId,
  })[0];

  let vaultBalanceLamports = 0;
  try {
    vaultBalanceLamports = await connection.getBalance(vaultAddress);
  } catch {}
  const vaultBalanceSOL = vaultBalanceLamports / 1_000_000_000;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white uppercase tracking-wider">
          Settings
        </h1>
        <p className="text-gray-400 mt-2">
          Manage your multisig members and configuration
        </p>
      </div>

      {/* Multisig Info Card */}
      <div className="relative p-[2px]"
           style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
        <div className="absolute inset-0 bg-gray-800" />
        <div 
          className="relative bg-transparent p-6"
          style={{ clipPath: 'polygon(10px 0, calc(100% - 2px) 0, calc(100% - 2px) calc(100% - 10px), calc(100% - 10px) calc(100% - 2px), 2px calc(100% - 2px), 2px 10px)' }}
        >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-trench-orange/10 border border-trench-orange/30"
               style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}>
            <Shield className="w-6 h-6 text-trench-orange" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-2">Multisig Address</h3>
            <p className="font-mono text-sm text-white break-all">{multisigCookie}</p>
            <div className="mt-4 flex gap-4 text-xs">
              <div>
                <span className="text-gray-500">Members: </span>
                <span className="text-white font-bold">{multisigInfo.members.length}</span>
              </div>
              <div>
                <span className="text-gray-500">Threshold: </span>
                <span className="text-white font-bold">{multisigInfo.threshold.toString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Transactions: </span>
                <span className="text-white font-bold">{multisigInfo.transactionIndex.toString()}</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Admin Payouts */}
      <AdminPayoutPanel
        members={multisigInfo.members.map((m) => m.key.toBase58())}
        multisigPda={multisigCookie!}
        vaultIndex={vaultIndex}
        programId={programId.toBase58()}
        vaultBalanceSOL={vaultBalanceSOL}
      />

      {/* Members Section */}
      <div className="relative p-[2px]"
           style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
        <div className="absolute inset-0 bg-gray-800" />
        <div 
          className="relative bg-transparent overflow-hidden"
          style={{ clipPath: 'polygon(10px 0, calc(100% - 2px) 0, calc(100% - 2px) calc(100% - 10px), calc(100% - 10px) calc(100% - 2px), 2px calc(100% - 2px), 2px 10px)' }}
        >
        {/* Header */}
        <div className="border-b border-gray-800 p-6">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-trench-orange" />
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                Members
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {multisigInfo.members.length} member{multisigInfo.members.length !== 1 ? 's' : ''} with full permissions
              </p>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="p-6 space-y-4">
          {multisigInfo.members.map((member, index) => (
            <div
              key={member.key.toBase58()}
              className="flex items-center justify-between p-4 bg-transparent border border-gray-800"
              style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-900 border border-gray-800 font-mono text-sm text-trench-orange font-bold"
                     style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-mono text-sm text-white">
                    {member.key.toBase58()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Permissions: {member.permissions.mask.toString()}
                  </p>
                </div>
              </div>
              <RemoveMemberButton
                rpcUrl={HARDCODED_RPC_URL}
                memberKey={member.key.toBase58()}
                multisigPda={multisigCookie!}
                transactionIndex={Number(multisigInfo.transactionIndex) + 1}
                programId={programId.toBase58()}
              />
            </div>
          ))}
        </div>
        </div>
      </div>

    </div>
  );
};

export default SettingsPage;
