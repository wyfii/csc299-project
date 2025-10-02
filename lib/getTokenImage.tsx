import Image from "next/image";

// Known token metadata
const KNOWN_TOKENS: { [mint: string]: { symbol: string; logo: string } } = {
  // NVAI token - use Nova logo
  "3SkFJRqMPTKZLqKK1MmY2mvAm711FGAtJ9ZbL6r1coin": {
    symbol: "NVAI",
    logo: "/logo.png",
  },
  // SOL
  "So11111111111111111111111111111111111111112": {
    symbol: "SOL",
    logo: "/sol-logo.png",
  },
  // Common SPL tokens - add more as needed
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": {
    symbol: "USDC",
    logo: `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png`,
  },
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": {
    symbol: "USDT",
    logo: `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png`,
  },
};

// Get token logo URL (string) for use with Next Image src
export function getTokenLogoUrl(mintAddress: string): string | null {
  // Check if it's a known token
  if (KNOWN_TOKENS[mintAddress]) {
    return KNOWN_TOKENS[mintAddress].logo;
  }
  
  // Try Solana token list
  return `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${mintAddress}/logo.png`;
}

// Get token symbol
export function getTokenSymbol(mintAddress: string): string | null {
  return KNOWN_TOKENS[mintAddress]?.symbol || null;
}

// Original function for backwards compatibility
export function getTokenImage(mintAddress: string, size: number = 32) {
  // NVAI token - use Nova logo
  if (mintAddress === "3SkFJRqMPTKZLqKK1MmY2mvAm711FGAtJ9ZbL6r1coin") {
    return (
      <Image
        src="/logo.png"
        alt="NVAI"
        width={size}
        height={size}
        className="rounded-full"
      />
    );
  }

  // SOL token
  if (mintAddress === "So11111111111111111111111111111111111111112" || mintAddress === "SOL") {
    return (
      <Image
        src="/sol-logo.png"
        alt="SOL"
        width={size}
        height={size}
        className="rounded-full"
      />
    );
  }

  // Default fallback
  return (
    <div 
      className="rounded-full bg-zinc-700 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <span className="text-gray-400 text-xs">?</span>
    </div>
  );
}

export const NVAI_MINT = "3SkFJRqMPTKZLqKK1MmY2mvAm711FGAtJ9ZbL6r1coin";
export const SOL_MINT = "So11111111111111111111111111111111111111112";

