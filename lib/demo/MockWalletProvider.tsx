"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { PublicKey } from '@solana/web3.js';
import { DEMO_WALLET_ADDRESS, mockDelay } from './mockData';

// Mock wallet context that simulates Solana wallet adapter
interface MockWalletContextState {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendTransaction: (transaction: any, connection: any, options?: any) => Promise<string>;
  signTransaction: (transaction: any) => Promise<any>;
  signAllTransactions: (transactions: any[]) => Promise<any[]>;
}

const MockWalletContext = createContext<MockWalletContextState | undefined>(undefined);

export function MockWalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);

  const connect = useCallback(async () => {
    setConnecting(true);
    await mockDelay(500); // Simulate connection delay
    setPublicKey(new PublicKey(DEMO_WALLET_ADDRESS));
    setConnected(true);
    setConnecting(false);
    console.log('🎭 Demo wallet connected:', DEMO_WALLET_ADDRESS);
  }, []);

  const disconnect = useCallback(async () => {
    setDisconnecting(true);
    await mockDelay(300);
    setPublicKey(null);
    setConnected(false);
    setDisconnecting(false);
    console.log('🎭 Demo wallet disconnected');
  }, []);

  const sendTransaction = useCallback(async (transaction: any, connection: any, options?: any) => {
    console.log('🎭 Mock transaction sent:', transaction);
    await mockDelay(1000); // Simulate transaction delay
    const mockSignature = 'DemoSignature' + Math.random().toString(36).substring(2, 15) + '111111111111111111111111111111111111';
    return mockSignature;
  }, []);

  const signTransaction = useCallback(async (transaction: any) => {
    console.log('🎭 Mock transaction signed');
    await mockDelay(500);
    return transaction;
  }, []);

  const signAllTransactions = useCallback(async (transactions: any[]) => {
    console.log('🎭 Mock transactions signed:', transactions.length);
    await mockDelay(500);
    return transactions;
  }, []);

  return (
    <MockWalletContext.Provider
      value={{
        publicKey,
        connected,
        connecting,
        disconnecting,
        connect,
        disconnect,
        sendTransaction,
        signTransaction,
        signAllTransactions,
      }}
    >
      {children}
    </MockWalletContext.Provider>
  );
}

export function useMockWallet() {
  const context = useContext(MockWalletContext);
  if (context === undefined) {
    throw new Error('useMockWallet must be used within a MockWalletProvider');
  }
  return context;
}

// Export a hook that matches the Solana wallet adapter interface
export function useWallet() {
  return useMockWallet();
}

