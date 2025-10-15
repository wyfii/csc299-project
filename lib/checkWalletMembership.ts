import { Connection, PublicKey } from "@solana/web3.js";
import * as multisig from "nova-multisig-sdk";
import { HARDCODED_RPC_URL, HARDCODED_RPC_HEADERS } from "@/lib/utils";

interface MultisigMembership {
  isMember: boolean;
  multisigs: string[]; // Array of multisig PDAs where wallet is a member
}

// Cache for membership checks to avoid repeated expensive RPC calls
const membershipCache = new Map<string, { data: MultisigMembership; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute cache

/**
 * Check if a wallet is a member of any multisig on the blockchain
 * This is different from checking if they created a multisig - this checks actual membership
 */
export async function checkWalletMultisigMembership(walletAddress: string): Promise<MultisigMembership> {
  // Check cache first
  const cached = membershipCache.get(walletAddress);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const connection = new Connection(HARDCODED_RPC_URL, {
    commitment: "confirmed",
    httpHeaders: HARDCODED_RPC_HEADERS,
  } as any);

  try {
    const walletPubkey = new PublicKey(walletAddress);
    
    // Get all multisig accounts where this wallet might be a member
    // We'll use getProgramAccounts to find all multisigs and check membership
    const multisigAccounts = await connection.getProgramAccounts(
      multisig.PROGRAM_ID,
      {
        filters: [
          // Filter for Multisig account type (discriminator)
          {
            memcmp: {
              offset: 0,
              bytes: "11111111111111111111111111111113", // Multisig account discriminator
            },
          },
        ],
      }
    );

    const memberMultisigs: string[] = [];

    // Check each multisig to see if wallet is a member
    for (const accountInfo of multisigAccounts) {
      try {
        const multisigAccount = multisig.accounts.Multisig.fromAccountInfo(accountInfo.account)[0];
        
        // Check if wallet is in the members list
        const isMember = multisigAccount.members.some(member => 
          member.key.equals(walletPubkey)
        );
        
        if (isMember) {
          memberMultisigs.push(accountInfo.pubkey.toBase58());
        }
      } catch (error) {
        // Skip invalid multisig accounts
        console.warn(`Failed to parse multisig account ${accountInfo.pubkey.toBase58()}:`, error);
        continue;
      }
    }

    const result: MultisigMembership = {
      isMember: memberMultisigs.length > 0,
      multisigs: memberMultisigs,
    };

    // Cache the result
    membershipCache.set(walletAddress, { data: result, timestamp: Date.now() });

    console.log(`Wallet ${walletAddress} membership check:`, result);
    return result;
  } catch (error) {
    console.error("Error checking wallet multisig membership:", error);
    
    // Return false on error but don't cache errors
    return {
      isMember: false,
      multisigs: [],
    };
  }
}

/**
 * Check if a wallet is a member of a specific multisig
 */
export async function isWalletMemberOfMultisig(
  walletAddress: string, 
  multisigPda: string
): Promise<boolean> {
  const connection = new Connection(HARDCODED_RPC_URL, {
    commitment: "confirmed",
    httpHeaders: HARDCODED_RPC_HEADERS,
  } as any);

  try {
    const walletPubkey = new PublicKey(walletAddress);
    const multisigAccount = await multisig.accounts.Multisig.fromAccountAddress(
      connection,
      new PublicKey(multisigPda)
    );

    return multisigAccount.members.some(member => member.key.equals(walletPubkey));
  } catch (error) {
    console.error("Error checking specific multisig membership:", error);
    return false;
  }
}
