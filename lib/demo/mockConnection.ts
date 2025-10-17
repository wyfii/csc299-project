// Mock Solana connection for demo mode
import { mockDelay, getDemoTokens, DEMO_WALLET_ADDRESS } from './mockData';

export class MockConnection {
  constructor(public endpoint: string, public commitment?: string) {
    console.log('🎭 Mock Connection created');
  }

  async getBalance(publicKey: any): Promise<number> {
    await mockDelay(300);
    // Return balance in lamports (1 SOL = 1,000,000,000 lamports)
    const tokens = getDemoTokens();
    const solToken = tokens.find(t => t.symbol === 'SOL');
    return Math.floor((solToken?.balance || 0) * 1_000_000_000);
  }

  async getLatestBlockhash(): Promise<{ blockhash: string; lastValidBlockHeight: number }> {
    await mockDelay(200);
    return {
      blockhash: 'DemoBlockhash' + Math.random().toString(36).substring(2, 15),
      lastValidBlockHeight: 200000000,
    };
  }

  async getSlot(): Promise<number> {
    await mockDelay(100);
    return Math.floor(Date.now() / 1000); // Use timestamp as mock slot
  }

  async confirmTransaction(signature: string, commitment?: string): Promise<any> {
    await mockDelay(1000);
    return {
      value: { err: null },
    };
  }

  async getTokenAccountBalance(publicKey: any): Promise<any> {
    await mockDelay(300);
    return {
      value: {
        amount: '5420350000', // Mock USDC amount
        decimals: 6,
        uiAmount: 5420.35,
        uiAmountString: '5420.35',
      },
    };
  }

  async getAccountInfo(publicKey: any): Promise<any> {
    await mockDelay(200);
    return {
      executable: false,
      owner: new (await import('@solana/web3.js')).PublicKey('11111111111111111111111111111111'),
      lamports: 1000000000,
      data: Buffer.from([]),
      rentEpoch: 0,
    };
  }

  async sendTransaction(transaction: any, signers: any[], options?: any): Promise<string> {
    await mockDelay(1000);
    const mockSignature = 'DemoTxSig' + Math.random().toString(36).substring(2, 15) + '1111111111111111111111111111111';
    console.log('🎭 Mock transaction sent:', mockSignature);
    return mockSignature;
  }

  async sendRawTransaction(rawTransaction: Buffer | Uint8Array, options?: any): Promise<string> {
    await mockDelay(1000);
    const mockSignature = 'DemoRawSig' + Math.random().toString(36).substring(2, 15) + '1111111111111111111111111111111';
    return mockSignature;
  }

  async simulateTransaction(transaction: any): Promise<any> {
    await mockDelay(500);
    return {
      value: {
        err: null,
        logs: ['🎭 Mock simulation successful'],
      },
    };
  }

  // Add other methods as needed
  async getParsedTokenAccountsByOwner(owner: any, filter: any): Promise<any> {
    await mockDelay(400);
    const tokens = getDemoTokens();
    return {
      value: tokens.map((token, index) => ({
        pubkey: `TokenAccount${index}111111111111111111111111111`,
        account: {
          data: {
            parsed: {
              info: {
                tokenAmount: {
                  amount: (token.balance * Math.pow(10, token.decimals)).toString(),
                  decimals: token.decimals,
                  uiAmount: token.balance,
                  uiAmountString: token.balance.toString(),
                },
                mint: token.mint,
                owner: DEMO_WALLET_ADDRESS,
              },
            },
          },
        },
      })),
    };
  }
}

export function getMockConnection(): MockConnection {
  return new MockConnection('https://demo-rpc.example.com', 'confirmed');
}

