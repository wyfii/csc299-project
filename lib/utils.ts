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
// Using Oobe Protocol staging RPC endpoint
// Can be overridden with NEXT_PUBLIC_RPC_URL environment variable
export const HARDCODED_RPC_URL = 
  process.env.NEXT_PUBLIC_RPC_URL || 
  "http://staging.oobeprotocol.ai:8080/rpc?api_key=sk_test_d9ae23e373954730ad6bb176dd637944";

export const HARDCODED_RPC_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
};

// Official program ID (novatSa4s7wJBHPoCWzyK45Z2N6ky3uYiBEQtw3FjJb)
export const OFFICIAL_PROGRAM_ID =
  "novatSa4s7wJBHPoCWzyK45Z2N6ky3uYiBEQtw3FjJb";
