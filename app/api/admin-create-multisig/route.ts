import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, Transaction, PublicKey } from '@solana/web3.js';
import * as multisig from 'nova-multisig-sdk';
import bs58 from 'bs58';

// API route for admin to create multisig after user burns NVAI
export async function POST(request: NextRequest) {
  try {
    const { multisigPda, createKeySecret, members, threshold, userWallet, programId, dryRun } = await request.json();
    
    console.log('🔐 Admin API called:', { userWallet, dryRun: !!dryRun, members: members?.length });
    
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
        console.log('✅ Loaded admin key from array format');
      } else {
        throw new Error('Not an array');
      }
    } catch (e) {
      // Try as base58
      try {
        adminKeypair = Keypair.fromSecretKey(bs58.decode(adminKeyString));
        console.log('✅ Loaded admin key from base58 format');
      } catch (e2) {
        console.error('❌ Failed to parse ADMIN_KEY');
        return NextResponse.json(
          { error: 'Invalid ADMIN_KEY format. Use either array or base58.' },
          { status: 500 }
        );
      }
    }
    
    const createKeyPair = Keypair.fromSecretKey(Uint8Array.from(createKeySecret));
    
    console.log('✅ Admin wallet:', adminKeypair.publicKey.toBase58());
    console.log('✅ CreateKey:', createKeyPair.publicKey.toBase58());
    console.log('✅ Multisig PDA:', multisigPda);

    // Connect to network
    const connection = new Connection(
      process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=bdafb51b-3059-4f6e-a2a3-5b4669dc5937',
      'confirmed'
    );

    // Check admin balance
    const adminBalance = await connection.getBalance(adminKeypair.publicKey);
    console.log('💰 Admin balance:', adminBalance / 1000000000, 'SOL');
    
    if (adminBalance < 15000000) { // Less than 0.015 SOL
      console.error('❌ Admin wallet low on SOL:', adminBalance / 1000000000);
      return NextResponse.json(
        { error: `Admin wallet has insufficient SOL (${(adminBalance / 1000000000).toFixed(4)} SOL). Please fund the admin wallet.` },
        { status: 500 }
      );
    }

    // If dry run, just validate and return
    if (dryRun) {
      console.log('✅ Dry run successful - admin ready to create multisig');
      return NextResponse.json({
        success: true,
        adminWallet: adminKeypair.publicKey.toBase58(),
        adminBalance: adminBalance / 1000000000,
      });
    }

    // Rebuild multisig creation from parameters
    console.log('📝 Building multisig creation transaction...');
    
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

    console.log('✅ Rebuilt members:', membersList.length);

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
    
    console.log('📝 Signing with admin and createKey...');
    
    // Sign with both admin and createKey
    tx.sign(adminKeypair, createKeyPair);
    
    console.log('📤 Sending transaction to network...');
    console.log('  Fee payer:', tx.feePayer?.toBase58());
    console.log('  Blockhash:', blockhash);
    
    // Send transaction
    const signature = await connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: false,
      maxRetries: 3,
    });
    
    console.log('✅ Transaction sent:', signature);
    
    console.log('⏳ Waiting for confirmation...');
    
    // Wait for confirmation
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });
    
    console.log('🎉 Multisig created successfully!');

    return NextResponse.json({
      signature,
      adminWallet: adminKeypair.publicKey.toBase58(),
    });
  } catch (error: any) {
    console.error('❌ Error in admin-create-multisig API:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create multisig',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}

