"use client";
import { useEffect, useState } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { motion } from "framer-motion";
import { Copy, QrCode } from "lucide-react";
import { toast } from "sonner";
import SendSol from "./SendSolButton";

interface PortfolioValueProps {
  solBalance: number;
  tokens: any;
  rpcUrl: string;
  vaultAddress: string;
  onSolPriceChange?: (price: number) => void;
}

export function PortfolioValue({ solBalance, tokens, rpcUrl, vaultAddress, onSolPriceChange }: PortfolioValueProps) {
  const [solPrice, setSolPrice] = useState(0);
  const [totalUSD, setTotalUSD] = useState(0);

  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const data = await response.json();
        const price = data.solana.usd;
        setSolPrice(price);
        onSolPriceChange?.(price);
      } catch (error) {
        const defaultPrice = 150;
        setSolPrice(defaultPrice);
        onSolPriceChange?.(defaultPrice);
      }
    };

    fetchSolPrice();
    const interval = setInterval(fetchSolPrice, 60000);
    return () => clearInterval(interval);
  }, [onSolPriceChange]);

  useEffect(() => {
    if (solPrice > 0) {
      const solValue = (solBalance / LAMPORTS_PER_SOL) * solPrice;
      
      // For now, we only calculate SOL value. Token prices would require additional API calls
      // TODO: Add token price calculations from CoinGecko or Jupiter API
      let tokenValue = 0;
      
      const totalValue = solValue + tokenValue;
      setTotalUSD(totalValue);
    }
  }, [solBalance, solPrice, tokens]);

  const copyAddress = () => {
    navigator.clipboard.writeText(vaultAddress);
    toast.success("Vault address copied!");
  };

  const solAmount = (solBalance / LAMPORTS_PER_SOL).toFixed(2);
  const shortAddress = `${vaultAddress.slice(0, 4)}...${vaultAddress.slice(-4)}`;

  return (
    <div className="mb-8 text-center">
      {/* Balance */}
      <h1 className="text-4xl font-medium text-white mb-1">
        {solAmount} SOL ≈ ${totalUSD.toFixed(2)} USD
      </h1>
      
      {/* Vault Address */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <span className="text-sm text-gray-500">Vault: {shortAddress}</span>
        <button
          onClick={copyAddress}
          className="text-gray-500 hover:text-white transition-colors"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button className="text-gray-500 hover:text-white transition-colors">
          <QrCode className="w-4 h-4" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-3">
        <button className="bg-white text-black hover:bg-gray-200 rounded-full px-6 py-2 text-sm font-medium transition-colors">
          DEPOSIT
        </button>
        <button className="bg-white text-black hover:bg-gray-200 rounded-full px-6 py-2 text-sm font-medium transition-colors">
          SEND
        </button>
      </div>
    </div>
  );
}

