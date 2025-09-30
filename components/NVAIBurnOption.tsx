"use client";
import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, createBurnInstruction } from "@solana/spl-token";
import { Button } from "./ui/button";
import { Flame, Sparkles, ArrowRight } from "lucide-react";
import { HARDCODED_RPC_URL, HARDCODED_RPC_HEADERS } from "@/lib/utils";
import { getNVAIPriceInSOL, calculateNVAIToBurn, NVAI_MINT_ADDRESS, MULTISIG_CREATION_COST_SOL } from "@/lib/getNVAIPrice";
import { motion } from "framer-motion";
import { getTokenImage } from "@/lib/getTokenImage";

type NVAIBurnOptionProps = {
  onSelect: (useNVAI: boolean) => void;
  selected: boolean;
};

export default function NVAIBurnOption({ onSelect, selected }: NVAIBurnOptionProps) {
  const { publicKey } = useWallet();
  const [nvaiBalance, setNvaiBalance] = useState<number>(0);
  const [nvaiPrice, setNvaiPrice] = useState<number>(0);
  const [nvaiToBurn, setNvaiToBurn] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNVAIData() {
      if (!publicKey) return;

      setLoading(true);
      try {
        const connection = new Connection(HARDCODED_RPC_URL, {
          commitment: "confirmed",
          httpHeaders: HARDCODED_RPC_HEADERS,
        } as any);

        // Get NVAI token account
        const nvaiATA = await getAssociatedTokenAddress(
          new PublicKey(NVAI_MINT_ADDRESS),
          publicKey
        );

        try {
          const tokenAccount = await connection.getTokenAccountBalance(nvaiATA);
          const balance = tokenAccount.value.uiAmount || 0;
          
          console.log('🪙 NVAI Balance Fetch:', {
            nvaiATA: nvaiATA.toBase58(),
            rawAmount: tokenAccount.value.amount,
            decimals: tokenAccount.value.decimals,
            uiAmount: balance,
          });
          
          setNvaiBalance(balance);
        } catch (error) {
          console.log("No NVAI tokens found");
          setNvaiBalance(0);
        }

        // Get current NVAI price
        const price = await getNVAIPriceInSOL();
        setNvaiPrice(price);
        
        console.log('💰 Price fetched:', price, 'SOL per NVAI');
        
        // Calculate how much NVAI to burn
        const burnAmount = calculateNVAIToBurn(MULTISIG_CREATION_COST_SOL, price);
        
        console.log('🔥 NVAI to burn calculated:', {
          solCost: MULTISIG_CREATION_COST_SOL,
          pricePerNVAI: price,
          burnAmount: burnAmount,
        });
        
        setNvaiToBurn(burnAmount);
      } catch (error) {
        console.error("Error loading NVAI data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadNVAIData();
  }, [publicKey]);

  const hasEnoughNVAI = nvaiBalance >= nvaiToBurn;

  if (loading) {
    return (
      <div className="p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
        <p className="text-sm text-gray-400">Loading NVAI option...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        p-6 rounded-xl border-2 cursor-pointer transition-all
        ${selected 
          ? 'bg-zinc-800/50 border-orange-500' 
          : 'bg-zinc-800/30 border-zinc-700 hover:border-zinc-600'
        }
      `}
      onClick={() => hasEnoughNVAI && onSelect(true)}
    >
      {/* Premium Badge */}
      <div className="absolute -top-3 -right-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
        <Sparkles className="w-3 h-3" />
        PREMIUM
      </div>

      <div className="flex items-start gap-4">
        {/* Token Images Side by Side */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14">
            {getTokenImage(NVAI_MINT_ADDRESS, 56)}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
            <Flame className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            Burn NVAI Tokens
            <Sparkles className="w-4 h-4 text-orange-400" />
          </h3>
          <p className="text-xs text-gray-400 mb-3">
            Exclusive for NVAI holders - Admin pays creation fees when you burn NVAI
          </p>

          <div className="space-y-2 bg-black/30 p-3 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {getTokenImage("SOL", 16)}
                <span className="text-gray-400">Cost in SOL:</span>
              </div>
              <span className="text-white font-semibold">~{MULTISIG_CREATION_COST_SOL} SOL</span>
            </div>
            
            <div className="flex items-center justify-center py-1">
              <ArrowRight className="w-4 h-4 text-orange-400" />
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {getTokenImage(NVAI_MINT_ADDRESS, 16)}
                <span className="text-gray-400">Burn NVAI:</span>
              </div>
              <span className="text-orange-400 font-bold">
                {nvaiToBurn.toLocaleString(undefined, { maximumFractionDigits: 0 })} NVAI
              </span>
            </div>
            
            <div className="h-px bg-zinc-700 my-2"></div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Your NVAI:</span>
              <span className={hasEnoughNVAI ? "text-green-400 font-semibold" : "text-red-400"}>
                {nvaiBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} NVAI
                {hasEnoughNVAI ? " ✓" : " ✗"}
              </span>
            </div>
          </div>

          {!hasEnoughNVAI && (
            <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-200">
              Need {(nvaiToBurn - nvaiBalance).toLocaleString()} more NVAI
            </div>
          )}

          {hasEnoughNVAI && (
            <div className="mt-3 p-2 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-200">
              ✓ You have enough NVAI! Admin will pay the SOL fees.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
