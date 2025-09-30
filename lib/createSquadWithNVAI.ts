import * as web3 from "@solana/web3.js";
import * as multisig from "nova-multisig-sdk";
import { PublicKey, Transaction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { createBurnInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import { Member } from "./createSquad";
import { NVAI_MINT_ADDRESS } from "./getNVAIPrice";

export async function createMultisigWithNVAIBurn(
  connection: web3.Connection,
  userWallet: web3.PublicKey, // User's wallet (will burn NVAI, will be multisig member)
  adminWallet: web3.Keypair, // Admin wallet (pays fees, NOT a member)
  members: Member[], // User + other members (admin NOT included)
  threshold: number,
  createKey: web3.PublicKey,
  nvaiAmountToBurn: number,
  programId?: string
) {
  try {
    console.log("🔥 Creating multisig with NVAI burn:");
    console.log("  User wallet:", userWallet.toBase58());
    console.log("  Admin wallet:", adminWallet.publicKey.toBase58());
    console.log("  NVAI to burn:", nvaiAmountToBurn);
    console.log("  Members:", members.length);
    console.log("  Admin is member:", members.some(m => m.key && m.key.toBase58() === adminWallet.publicKey.toBase58()));

    // Get user's NVAI token account
    const userNVAIAccount = await getAssociatedTokenAddress(
      new PublicKey(NVAI_MINT_ADDRESS),
      userWallet
    );

    // Create burn instruction (user burns their NVAI)
    // NVAI has 9 decimals, so multiply by 1e9
    const burnAmountLamports = BigInt(Math.floor(nvaiAmountToBurn * 1000000000)); // 9 decimals
    
    console.log("🔥 Burn amount:", {
      nvaiToBurn: nvaiAmountToBurn,
      lamports: burnAmountLamports.toString(),
    });
    
    const burnIx = createBurnInstruction(
      userNVAIAccount,
      new PublicKey(NVAI_MINT_ADDRESS),
      userWallet, // User authority
      burnAmountLamports
    );

    // Get multisig PDA
    const multisigPda = multisig.getMultisigPda({
      createKey,
      programId: programId ? new web3.PublicKey(programId) : multisig.PROGRAM_ID,
    })[0];

    const [programConfig] = multisig.getProgramConfigPda({
      programId: programId ? new web3.PublicKey(programId) : multisig.PROGRAM_ID,
    });

    const programConfigInfo =
      await multisig.accounts.ProgramConfig.fromAccountAddress(
        connection,
        programConfig
      );

    const configTreasury = programConfigInfo.treasury;

    // Create multisig instruction (admin pays, but user is creator)
    const multisigIx = multisig.instructions.multisigCreateV2({
      multisigPda: multisigPda,
      createKey: createKey,
      creator: adminWallet.publicKey, // Admin is creator (pays rent)
      members: members as any, // User + others (NOT admin)
      threshold: threshold,
      configAuthority: null,
      treasury: configTreasury,
      rentCollector: null,
      timeLock: 0,
      programId: programId ? new web3.PublicKey(programId) : multisig.PROGRAM_ID,
    });

    // Build transaction with both instructions
    const { blockhash } = await connection.getLatestBlockhash();
    
    const message = new TransactionMessage({
      instructions: [burnIx, multisigIx], // 1. User burns NVAI, 2. Admin creates multisig
      payerKey: adminWallet.publicKey, // Admin pays transaction fees
      recentBlockhash: blockhash,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(message);

    return {
      transaction,
      multisigPda,
      requiresUserSignature: true, // User needs to sign for burn
      requiresAdminSignature: true, // Admin needs to sign for payment
    };
  } catch (err) {
    console.error("Error creating multisig with NVAI:", err);
    throw err;
  }
}

// Check if user has enough NVAI to burn
export async function checkNVAIBalance(
  connection: web3.Connection,
  userWallet: web3.PublicKey,
  requiredAmount: number
): Promise<{ hasEnough: boolean; balance: number }> {
  try {
    const userNVAIAccount = await getAssociatedTokenAddress(
      new PublicKey(NVAI_MINT_ADDRESS),
      userWallet
    );

    const tokenAccount = await connection.getTokenAccountBalance(userNVAIAccount);
    const balance = tokenAccount.value.uiAmount || 0;

    return {
      hasEnough: balance >= requiredAmount,
      balance: balance,
    };
  } catch (error) {
    console.log("No NVAI account found");
    return { hasEnough: false, balance: 0 };
  }
}
