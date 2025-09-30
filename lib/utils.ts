import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function range(start: number, end: number): number[] {
  const result: number[] = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
}

// Centralized RPC configuration for Solana connections
// Using Helius RPC for better performance and higher rate limits
export const HARDCODED_RPC_URL = "https://mainnet.helius-rpc.com/?api-key=bdafb51b-3059-4f6e-a2a3-5b4669dc5937";

export const HARDCODED_RPC_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
};

// Official program ID (novatSa4s7wJBHPoCWzyK45Z2N6ky3uYiBEQtw3FjJb)
export const OFFICIAL_PROGRAM_ID =
  "novatSa4s7wJBHPoCWzyK45Z2N6ky3uYiBEQtw3FjJb";
