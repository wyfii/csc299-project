// Fetch NVAI/SOL price - Using known market rate
export async function getNVAIPriceInSOL(): Promise<number> {
  // Based on actual market data provided by user:
  // 0.01 SOL = ~17,000 NVAI
  // Therefore: 1 NVAI = 0.01 / 17000 = 0.000000588 SOL
  
  const MARKET_RATE = 0.000000588; // 1 NVAI ≈ 0.000000588 SOL
  
  console.log('💰 Using market rate:', {
    pricePerNVAI: MARKET_RATE,
    nvaiPer001SOL: 0.01 / MARKET_RATE,
    formatted: `1 NVAI = ${MARKET_RATE} SOL (${Math.round(0.01 / MARKET_RATE).toLocaleString()} NVAI per 0.01 SOL)`
  });
  
  return MARKET_RATE;
  
  /* Jupiter API integration disabled - returns incorrect rates due to low liquidity
  try {
    const NVAI_MINT = "3SkFJRqMPTKZLqKK1MmY2mvAm711FGAtJ9ZbL6r1coin";
    const nvaiAmount = 1000 * 1000000000; // 1000 NVAI with 9 decimals
    
    const quoteResponse = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${NVAI_MINT}&outputMint=So11111111111111111111111111111111111111112&amount=${nvaiAmount}&slippageBps=50`,
      { cache: 'no-store', signal: AbortSignal.timeout(5000) }
    );
    
    if (quoteResponse.ok) {
      const quoteData = await quoteResponse.json();
      if (quoteData.outAmount) {
        const solReceived = parseInt(quoteData.outAmount) / 1000000000;
        const pricePerNVAI = solReceived / 1000;
        if (pricePerNVAI > 0.0000001 && pricePerNVAI < 0.00001) {
          return pricePerNVAI;
        }
      }
    }
  } catch (error) {
    console.log("Jupiter API error, using market rate");
  }
  */
  
  return MARKET_RATE;
}

export function calculateNVAIToBurn(solCost: number, nvaiPriceInSOL: number): number {
  if (nvaiPriceInSOL <= 0) return 0;
  const amount = solCost / nvaiPriceInSOL;
  console.log('💰 NVAI Calculation:', {
    solCost,
    nvaiPriceInSOL,
    calculatedNVAI: amount,
  });
  return amount;
}

export const NVAI_MINT_ADDRESS = "3SkFJRqMPTKZLqKK1MmY2mvAm711FGAtJ9ZbL6r1coin";
export const NVAI_DECIMALS = 9; // NVAI has 9 decimals
export const MULTISIG_CREATION_COST_SOL = 0.01; // Approximate cost in SOL

