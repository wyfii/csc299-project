import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, Transaction, PublicKey } from '@solana/web3.js';
import * as multisig from 'nova-multisig-sdk';
import bs58 from 'bs58';

// API route for admin to create multisig after user burns NVAI
export async function POST(request: NextRequest) {
  try {
    const { multisigPda, createKeySecret, members, threshold, userWallet, programId, dryRun } = await request.json();
    
    // Admin API called - logging disabled for security
    
    // Get admin private key from environment variable
    const adminKeyString = process.env.ADMIN_KEY;
    
    if (!adminKeyString) {
      console.error('❌ ADMIN_KEY not configured in environment');
      return NextResponse.json(
        { error: 'Admin wallet not configured. Please set ADMIN_KEY in .env' },
        { status: 500 }
      );
    }

    // Decode admin keypair - handle both array format and base58
    let adminKeypair: Keypair;
    try {
      // Try parsing as JSON array first (format from .env)
      const keyArray = JSON.parse(adminKeyString);
      if (Array.isArray(keyArray)) {
        adminKeypair = Keypair.fromSecretKey(Uint8Array.from(keyArray));
        // Admin key loaded from array format
      } else {
        throw new Error('Not an array');
      }
    } catch (e) {
      // Try as base58
      try {
        adminKeypair = Keypair.fromSecretKey(bs58.decode(adminKeyString));
        // Admin key loaded from base58 format
      } catch (e2) {
        console.error('❌ Failed to parse ADMIN_KEY');
        return NextResponse.json(
          { error: 'Invalid ADMIN_KEY format. Use either array or base58.' },
          { status: 500 }
        );
      }
    }
    
    const createKeyPair = Keypair.fromSecretKey(Uint8Array.from(createKeySecret));
    
    // Admin wallet and create key initialized

    // Connect to network
    const connection = new Connection(
      process.env.NEXT_PUBLIC_RPC_URL || 'http://staging.oobeprotocol.ai:8080/rpc?api_key=sk_test_d9ae23e373954730ad6bb176dd637944',
      'confirmed'
    );

    // Check admin balance
    const adminBalance = await connection.getBalance(adminKeypair.publicKey);
    // Admin balance checked
    
    if (adminBalance < 15000000) { // Less than 0.015 SOL
      // Admin wallet low on SOL
      return NextResponse.json(
        { error: `Admin wallet has insufficient SOL (${(adminBalance / 1000000000).toFixed(4)} SOL). Please fund the admin wallet.` },
        { status: 500 }
      );
    }

    // If dry run, just validate and return
    if (dryRun) {
      // Dry run successful - admin ready to create multisig
      return NextResponse.json({
        success: true,
        adminWallet: adminKeypair.publicKey.toBase58(),
        adminBalance: adminBalance / 1000000000,
      });
    }

    // Rebuild multisig creation from parameters
    // Building multisig creation transaction
    
    // Get program config
    const [programConfig] = multisig.getProgramConfigPda({
      programId: new PublicKey(programId),
    });

    const programConfigInfo = await multisig.accounts.ProgramConfig.fromAccountAddress(
      connection,
      programConfig
    );

    // Rebuild members with PublicKeys
    const membersList = members.map((m: any) => ({
      key: new PublicKey(m.key),
      permissions: m.permissions,
    }));

    // Members list rebuilt

    // Create the multisig instruction
    const multisigIx = multisig.instructions.multisigCreateV2({
      multisigPda: new PublicKey(multisigPda),
      createKey: createKeyPair.publicKey,
      creator: adminKeypair.publicKey, // Admin is creator (pays rent)
      members: membersList as any,
      threshold: threshold,
      configAuthority: null,
      treasury: programConfigInfo.treasury,
      rentCollector: null,
      timeLock: 0,
      programId: new PublicKey(programId),
    });
    
    // Get fresh blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    
    // Create transaction
    const tx = new Transaction();
    tx.recentBlockhash = blockhash;
    tx.feePayer = adminKeypair.publicKey; // Admin pays ALL fees
    tx.add(multisigIx);
    
    // Signing transaction with admin and createKey
    
    // Sign with both admin and createKey
    tx.sign(adminKeypair, createKeyPair);
    
    // Sending transaction to network
    
    // Send transaction
    const signature = await connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: false,
      maxRetries: 3,
    });
    
    // Transaction sent, waiting for confirmation
    
    // Wait for confirmation
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });
    
    // Multisig created successfully

    return NextResponse.json({
      signature,
      adminWallet: adminKeypair.publicKey.toBase58(),
    });
  } catch (error: any) {
    console.error('❌ Error in admin-create-multi-sig API:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create multi-sig',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}

