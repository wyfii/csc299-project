"use client";
import { useEffect, useState } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { motion } from "framer-motion";

interface PortfolioValueProps {
  solBalance: number;
  tokens: any;
  rpcUrl: string;
}

export function PortfolioValue({ solBalance, tokens }: PortfolioValueProps) {
  const [totalValue, setTotalValue] = useState(0);
  const [displayValue, setDisplayValue] = useState(0);
  const [solPrice, setSolPrice] = useState(0);

  useEffect(() => {
    // Fetch SOL price from a price API
    const fetchSolPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const data = await response.json();
        setSolPrice(data.solana.usd);
      } catch (error) {
        console.error('Failed to fetch SOL price');
        setSolPrice(150); // Fallback price
      }
    };

    fetchSolPrice();
    const interval = setInterval(fetchSolPrice, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (solPrice > 0) {
      const solValue = (solBalance / LAMPORTS_PER_SOL) * solPrice;
      // For now, just show SOL value. Token prices would need additional API calls
      setTotalValue(solValue);
    }
  }, [solBalance, solPrice]);

  useEffect(() => {
    // Animate the number
    const duration = 1000; // 1 second
    const steps = 60;
    const increment = totalValue / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, totalValue);
      setDisplayValue(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(totalValue);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [totalValue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-zinc-950/50 border border-zinc-900 rounded-lg p-8 mb-6"
    >
      <div className="text-center">
        <p className="text-sm text-gray-500 font-mono mb-2">Total Value</p>
        <h2 className="text-5xl md:text-6xl font-bold text-white font-mono tracking-tight">
          ${displayValue.toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}
        </h2>
        <p className="text-xs text-gray-600 font-mono mt-2">
          {(solBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL @ ${solPrice.toFixed(2)}
        </p>
      </div>
    </motion.div>
  );
}

