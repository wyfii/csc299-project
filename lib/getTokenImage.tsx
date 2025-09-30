import Image from "next/image";

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

