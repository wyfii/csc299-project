import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { cookies, headers } from "next/headers";
import * as multisig from "nova-multisig-sdk";
import { TokenList } from "@/components/TokenList";
import { VaultDisplayer } from "@/components/VaultDisplayer";
import EmptyMultisigState from "@/components/EmptyMultisigState";
import MultisigAddressDisplay from "@/components/MultisigAddressDisplay";
import { PortfolioValue } from "@/components/PortfolioValue";
import { getMultisigFromFirestore } from "@/lib/getMultisigFromFirestore";
import { HARDCODED_RPC_URL, HARDCODED_RPC_HEADERS } from "@/lib/utils";

// Add caching to reduce RPC calls
export const revalidate = 30; // Cache for 30 seconds
export const dynamic = 'force-dynamic'; // Still dynamic for user-specific data

export default async function Home() {
  const connection = new Connection(HARDCODED_RPC_URL, {
    commitment: "confirmed",
    httpHeaders: HARDCODED_RPC_HEADERS,
  } as any);

  // Get wallet address from header (set by middleware from cookie)
  const walletAddress = headers().get("x-wallet");
  
  // Fetch multisig from Firestore using wallet address
  let multisigCookie: string | null = null;
  if (walletAddress) {
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
    tokensInWallet = await connection.getParsedTokenAccountsByOwner(
      multisigVault,
      {
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      }
    );
  } catch (error) {
    console.error("Failed to fetch vault data:", error);
    // Continue with default values (0 balance, no tokens)
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      {/* Header - Balance */}
      <PortfolioValue
        solBalance={solBalance}
        tokens={tokensInWallet}
        rpcUrl={HARDCODED_RPC_URL}
        vaultAddress={multisigVault.toBase58()}
      />

      {/* Portfolio List */}
      <TokenList
        solBalance={solBalance}
        tokens={tokensInWallet}
        rpcUrl={HARDCODED_RPC_URL}
        multisigPda={multisigCookie}
        vaultIndex={vaultIndex}
        programId={programIdCookie!}
      />
    </main>
  );
}
