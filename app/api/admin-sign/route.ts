import { NextRequest, NextResponse } from 'next/server';
import { Keypair, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';

// API route to sign transactions with admin wallet (server-side only for security)
export async function POST(request: NextRequest) {
  try {
    const { transaction } = await request.json();
    
    // Get admin private key from environment variable (server-side only!)
    const adminKey = process.env.ADMIN_KEY;
    
    if (!adminKey) {
      return NextResponse.json(
        { error: 'Admin key not configured' },
        { status: 500 }
      );
    }

    // Decode admin keypair - handle both array and base58 formats
    let adminKeypair: Keypair;
    try {
      const keyArray = JSON.parse(adminKey);
      if (Array.isArray(keyArray)) {
        adminKeypair = Keypair.fromSecretKey(Uint8Array.from(keyArray));
      } else {
        throw new Error('Not an array');
      }
    } catch (e) {
      try {
        adminKeypair = Keypair.fromSecretKey(bs58.decode(adminKey));
      } catch (e2) {
        return NextResponse.json(
          { error: 'Invalid ADMIN_KEY format' },
          { status: 500 }
        );
      }
    }

    console.log('🔐 Admin wallet signing transaction:', adminKeypair.publicKey.toBase58());

    // Deserialize transaction
    const tx = VersionedTransaction.deserialize(Buffer.from(transaction, 'base64'));
    
    // Sign with admin wallet
    tx.sign([adminKeypair]);

    // Return signed transaction
    return NextResponse.json({
      signedTransaction: Buffer.from(tx.serialize()).toString('base64'),
      adminPublicKey: adminKeypair.publicKey.toBase58(),
    });
  } catch (error: any) {
    console.error('Error in admin-sign API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sign transaction' },
      { status: 500 }
    );
  }
}

