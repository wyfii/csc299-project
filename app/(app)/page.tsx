import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { cookies, headers } from "next/headers";
import * as multisig from "nova-multisig-sdk";
import { VaultDisplayer } from "@/components/VaultDisplayer";
import EmptyMultisigState from "@/components/EmptyMultisigState";
import MultisigAddressDisplay from "@/components/MultisigAddressDisplay";
import { PortfolioWrapper } from "@/components/PortfolioWrapper";
import { getMultisigFromFirestore } from "@/lib/getMultisigFromFirestore";
import { HARDCODED_RPC_URL, HARDCODED_RPC_HEADERS } from "@/lib/utils";

// Force dynamic to ensure vault switching works immediately
export const revalidate = 0; // No caching - always fetch fresh data
export const dynamic = 'force-dynamic';

export default async function Home() {
  const connection = new Connection(HARDCODED_RPC_URL, {
    commitment: "confirmed",
    httpHeaders: HARDCODED_RPC_HEADERS,
  } as any);

  // Get wallet address and optionally selected multisig from headers (set by middleware)
  const walletAddress = headers().get("x-wallet");
  const selectedMultisig = headers().get("x-multisig");
  
  // Determine active multisig: prefer explicitly selected, else Firestore default
  let multisigCookie: string | null = null;
  if (selectedMultisig) {
    multisigCookie = selectedMultisig;
  } else if (walletAddress) {
    multisigCookie = await getMultisigFromFirestore(walletAddress);
  }
  
  if (!multisigCookie) {
    return (
      <main className="">
        <div>
          <h1 className="text-3xl font-bold mb-4 font-sans">Overview</h1>
          <EmptyMultisigState />
        </div>
      </main>
    );
  }

  let multisigPda: PublicKey;
  try {
    multisigPda = new PublicKey(multisigCookie);
  } catch {
    return (
      <main className="">
        <div>
          <h1 className="text-3xl font-bold mb-4 font-sans">Overview</h1>
          <EmptyMultisigState />
        </div>
      </main>
    );
  }

  const vaultIndex = Number(headers().get("x-vault-index")) || 0;

  const programIdCookie = cookies().get("x-program-id")?.value;
  let programId: PublicKey = multisig.PROGRAM_ID;
  if (programIdCookie) {
    try {
      programId = new PublicKey(programIdCookie);
    } catch {
      programId = multisig.PROGRAM_ID;
    }
  }

  const multisigVault = multisig.getVaultPda({
    multisigPda,
    index: vaultIndex,
    programId,
  })[0];

  let solBalance = 0;
  let tokensInWallet: any = { value: [] };

  try {
    solBalance = await connection.getBalance(multisigVault);
    const rawTokens = await connection.getParsedTokenAccountsByOwner(
      multisigVault,
      {
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      }
    );
    
    // Serialize PublicKey objects to strings to avoid React warnings
    tokensInWallet = {
      context: rawTokens.context,
      value: rawTokens.value.map((token) => ({
        pubkey: token.pubkey.toBase58(),
        account: {
          ...token.account,
          owner: token.account.owner.toBase58(),
          data: token.account.data,
        }
      }))
    };
  } catch (error) {
    console.error("Failed to fetch vault data:", error);
    // Continue with default values (0 balance, no tokens)
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <PortfolioWrapper
        solBalance={solBalance}
        tokens={tokensInWallet}
        rpcUrl={HARDCODED_RPC_URL}
        vaultAddress={multisigVault.toBase58()}
        multisigPda={multisigCookie}
        vaultIndex={vaultIndex}
        programId={programId.toBase58()}
      />
    </main>
  );
}
