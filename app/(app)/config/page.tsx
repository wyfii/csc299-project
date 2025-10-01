import AddMemberInput from "@/components/AddMemberInput";
import ChangeThresholdInput from "@/components/ChangeThresholdInput";
import ChangeUpgradeAuthorityInput from "@/components/ChangeUpgradeAuthorityInput";
import RemoveMemberButton from "@/components/RemoveMemberButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { HARDCODED_RPC_HEADERS, HARDCODED_RPC_URL, OFFICIAL_PROGRAM_ID } from "@/lib/utils";
import * as multisig from "nova-multisig-sdk";
import { cookies, headers } from "next/headers";
import { getMultisigFromFirestore } from "@/lib/getMultisigFromFirestore";

// Add caching to reduce RPC calls
export const revalidate = 30; // Cache for 30 seconds
export const dynamic = 'force-dynamic';

const ConfigurationPage = async () => {
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
      <div className="">
        <h1 className="text-3xl font-bold mb-4">Multisig Configuration</h1>
      </div>
    );
  }
  let multisigPda: PublicKey;
  try {
    multisigPda = new PublicKey(multisigCookie);
  } catch {
    return (
      <div className="">
        <h1 className="text-3xl font-bold mb-4">Multisig Configuration</h1>
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
      <div className="">
        <h1 className="text-3xl font-bold mb-4">Multisig Configuration</h1>
        <p className="text-sm text-slate-600">
          Multisig not found at {multisigCookie}. Check the multisig address,
          selected program ID, and RPC/cluster, then try again.
        </p>
      </div>
    );
  }
  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-4">Multisig Configuration</h1>
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            List of members in the multisig as well as their permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {multisigInfo.members.map((member) => (
              <div key={member.key.toBase58()}>
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Public Key: {member.key.toBase58()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Permission Mask:
                      {member.permissions.mask.toString()}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <RemoveMemberButton
                      rpcUrl={HARDCODED_RPC_URL}
                      memberKey={member.key.toBase58()}
                      multisigPda={multisigCookie!}
                      transactionIndex={
                        Number(multisigInfo.transactionIndex) + 1
                      }
                      programId={programId.toBase58()}
                    />
                  </div>
                </div>
                <hr className="mt-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="flex pb-4">
        <Card className="mt-4 w-1/2 mr-2">
          <CardHeader>
            <CardTitle>Add Member</CardTitle>
            <CardDescription>Add a member to the Multisig</CardDescription>
          </CardHeader>
          <CardContent>
            <AddMemberInput
              multisigPda={multisigCookie!}
              rpcUrl={HARDCODED_RPC_URL}
              transactionIndex={Number(multisigInfo.transactionIndex) + 1}
              programId={programId.toBase58()}
            />
          </CardContent>
        </Card>
        <Card className="mt-4 w-1/2">
          <CardHeader>
            <CardTitle>Change Threshold</CardTitle>
            <CardDescription>
              Change the threshold required to execute a multisig transaction.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangeThresholdInput
              multisigPda={multisigCookie!}
              rpcUrl={HARDCODED_RPC_URL}
              transactionIndex={Number(multisigInfo.transactionIndex) + 1}
              programId={programId.toBase58()}
            />
          </CardContent>
        </Card>
      </div>
      {/* Hidden for now - Change program Upgrade authority */}
      {/* <div className="pb-4">
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Change program Upgrade authority</CardTitle>
            <CardDescription>
              Change the upgrade authority of one of your programs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangeUpgradeAuthorityInput
              multisigPda={multisigCookie!}
              rpcUrl={HARDCODED_RPC_URL}
              transactionIndex={Number(multisigInfo.transactionIndex) + 1}
              vaultIndex={vaultIndex}
              globalProgramId={programId.toBase58()}
            />
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
};

export default ConfigurationPage;
