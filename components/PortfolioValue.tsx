"use client";
import { useEffect, useState } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { motion, useSpring, useTransform } from "framer-motion";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import * as multisig from "nova-multisig-sdk";
import SendSol from "./SendSolButton";
import { VaultSelector } from "./VaultSelector";
import DecryptedText from "./DecryptedText";
import DepositButton from "./DepositButton";

interface PortfolioValueProps {
  solBalance: number;
  tokens: any;
  rpcUrl: string;
  vaultAddress: string;
  vaultIndex: number;
  multisigPda?: string;
  programId?: string;
  onSolPriceChange?: (price: number) => void;
}

interface TokenPrice {
  id: string;
  mintSymbol: string;
  price: number;
}

interface JupiterPriceResponse {
  data: {
    [key: string]: TokenPrice;
  };
}

export function PortfolioValue({ solBalance, tokens, rpcUrl, vaultAddress, vaultIndex, multisigPda, programId, onSolPriceChange }: PortfolioValueProps) {
  const [solPrice, setSolPrice] = useState(0);
  const [tokenPrices, setTokenPrices] = useState<{[key: string]: number}>({});
  const [totalUSD, setTotalUSD] = useState(0);
  const [allVaultsData, setAllVaultsData] = useState<any[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [isLoadingVaults, setIsLoadingVaults] = useState(false);

  // Animated counter using Framer Motion
  const animatedValue = useSpring(totalUSD, {
    stiffness: 100,
    damping: 30,
    mass: 1,
  });

  const displayValue = useTransform(animatedValue, (value) => {
    if (value < 0.01 && value > 0) {
      return `$${value.toFixed(6)}`;
    }
    return `$${value.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  });

  // Animated Counter Component - Simplified for testing
  const AnimatedCounter = () => {
    const formattedValue = totalUSD.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });

    console.log('AnimatedCounter - value:', formattedValue, 'totalUSD:', totalUSD, 'loading:', isLoadingPrices, isLoadingVaults);

    return (
      <motion.div 
        className="text-4xl md:text-5xl font-bold text-white font-mono mb-1"
        key={formattedValue}
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        ${formattedValue}
      </motion.div>
    );
  };

  // Fetch all vaults data (vault 0-15)
  const fetchAllVaultsData = async () => {
    console.log('🔍 fetchAllVaultsData called with:', { multisigPda, programId, rpcUrl });
    
    if (!multisigPda || !programId) {
      console.warn('⚠️ Missing multisigPda or programId - using SINGLE VAULT ONLY');
      console.warn('multisigPda:', multisigPda);
      console.warn('programId:', programId);
      setAllVaultsData([{ solBalance, tokens, vaultIndex }]);
      setIsLoadingVaults(false);
      return;
    }

    setIsLoadingVaults(true);
    console.log('🏦 Fetching ALL 16 vaults data for multisig:', multisigPda);
    console.log('Using programId:', programId);

    try {
      const connection = new Connection(rpcUrl, { commitment: "confirmed" });
      const multisigPdaKey = new PublicKey(multisigPda);
      const programIdKey = new PublicKey(programId);
      
      const vaultPromises = [];
      
      // Fetch data for all 16 vaults (0-15)
      for (let i = 0; i < 16; i++) {
        const vaultPromise = (async () => {
          try {
            const vaultPda = multisig.getVaultPda({
              multisigPda: multisigPdaKey,
              index: i,
              programId: programIdKey,
            })[0];

            const [solBalance, rawTokenAccounts] = await Promise.all([
              connection.getBalance(vaultPda),
              connection.getParsedTokenAccountsByOwner(vaultPda, {
                programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
              })
            ]);

            // Serialize PublicKey objects to strings
            const serializedTokens = {
              context: rawTokenAccounts.context,
              value: rawTokenAccounts.value.map((token) => ({
                pubkey: token.pubkey.toBase58(),
                account: {
                  ...token.account,
                  owner: token.account.owner.toBase58(),
                  data: token.account.data,
                }
              }))
            };

            return {
              vaultIndex: i,
              solBalance,
              tokens: serializedTokens,
              vaultAddress: vaultPda.toBase58()
            };
          } catch (error) {
            console.log(`Vault ${i} error (likely empty):`, error);
            return {
              vaultIndex: i,
              solBalance: 0,
              tokens: { value: [] },
              vaultAddress: ''
            };
          }
        })();
        
        vaultPromises.push(vaultPromise);
      }

      const allVaults = await Promise.all(vaultPromises);
      
      // Filter out empty vaults for logging
      const nonEmptyVaults = allVaults.filter(v => v.solBalance > 0 || v.tokens.value.length > 0);
      console.log(`✅ SUCCESS: Found ${nonEmptyVaults.length} non-empty vaults out of 16`);
      console.log('Non-empty vaults:', nonEmptyVaults);
      
      console.log('Setting allVaultsData with', allVaults.length, 'vaults');
      setAllVaultsData(allVaults);
    } catch (error) {
      console.error('Error fetching all vaults:', error);
      // Fallback to single vault
      setAllVaultsData([{ solBalance, tokens, vaultIndex }]);
    } finally {
      setIsLoadingVaults(false);
    }
  };

  // Format large numbers with commas
  const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  // Format token amounts (no decimals for whole numbers, up to 4 for fractional)
  const formatTokenAmount = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toLocaleString('en-US', { 
        minimumFractionDigits: 1, 
        maximumFractionDigits: 2 
      }) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toLocaleString('en-US', { 
        minimumFractionDigits: 1, 
        maximumFractionDigits: 2 
      }) + 'K';
    } else if (num >= 1) {
      return num.toLocaleString('en-US', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
      });
    } else {
      return num.toLocaleString('en-US', { 
        minimumFractionDigits: 4, 
        maximumFractionDigits: 6 
      });
    }
  };

  // Fetch all vaults - runs when multisigPda/programId become available
  // but NOT when vaultIndex changes (that's just UI selection)
  useEffect(() => {
    console.log('\n🏦 ========================================');
    console.log('🏦 CHECKING IF SHOULD FETCH ALL VAULTS');
    console.log('🏦 ========================================');
    console.log('multisigPda:', multisigPda);
    console.log('programId:', programId);
    console.log('allVaultsData.length:', allVaultsData.length);
    
    // Only fetch if we have the required props AND haven't fetched yet
    if (multisigPda && programId && allVaultsData.length === 0) {
      console.log('✅✅✅ FETCHING ALL 16 VAULTS FOR TOTAL PORTFOLIO ✅✅✅');
      fetchAllVaultsData();
    } else if (!multisigPda || !programId) {
      console.error('❌ MISSING PROPS - CANNOT FETCH ALL VAULTS');
      console.error('  multisigPda:', multisigPda || 'MISSING');
      console.error('  programId:', programId || 'MISSING');
    } else {
      console.log('✅ Already have all vaults data (length:', allVaultsData.length, ')');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multisigPda, programId]); // Run when these become available, but NOT on vaultIndex change!

  // REMOVED - This was resetting allVaultsData when switching vaults!

  // Simplified price fetching - just get prices and calculate
  useEffect(() => {
    const fetchPricesAndCalculate = async () => {
      setIsLoadingPrices(true);
      console.log('💰 Starting price fetch...');
      
      try {
        // Get SOL price
        const cgResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const cgData = await cgResponse.json();
        const fetchedSolPrice = cgData.solana?.usd || 220;
        console.log('SOL Price:', fetchedSolPrice);
        setSolPrice(fetchedSolPrice);
        onSolPriceChange?.(fetchedSolPrice);
        
        // Collect all unique tokens from all vaults
        const allTokenMints = new Set<string>();
        allVaultsData.forEach(vault => {
          if (vault.tokens?.value) {
            vault.tokens.value.forEach((token: any) => {
              allTokenMints.add(token.account.data.parsed.info.mint);
            });
          }
        });
        
        const mints = Array.from(allTokenMints);
        console.log('Unique token mints found:', mints);
        
        // Get token prices (CoinGecko is most reliable)
        const priceMap: {[key: string]: number} = {};
        for (const mint of mints) {
          try {
            const res = await fetch(`https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${mint}&vs_currencies=usd`);
            const data = await res.json();
            if (data[mint]?.usd) {
              priceMap[mint] = data[mint].usd;
              console.log(`Price for ${mint.slice(0, 8)}: $${data[mint].usd}`);
            }
          } catch (e) {
            console.log(`No price for ${mint.slice(0, 8)}`);
          }
        }
        setTokenPrices(priceMap);
        
        // Now calculate total value
        let total = 0;
        
        // Add SOL from all vaults
        allVaultsData.forEach(vault => {
          const solVal = (vault.solBalance / LAMPORTS_PER_SOL) * fetchedSolPrice;
          total += solVal;
        });
        
        // Add all tokens from all vaults
        allVaultsData.forEach(vault => {
          if (vault.tokens?.value) {
            vault.tokens.value.forEach((token: any) => {
              const mint = token.account.data.parsed.info.mint;
              const amount = token.account.data.parsed.info.tokenAmount.uiAmount || 0;
              const price = priceMap[mint] || 0;
              const value = amount * price;
              total += value;
              if (value > 0) {
                console.log(`Adding: ${amount} × $${price} = $${value.toFixed(2)}`);
              }
            });
          }
        });
        
        console.log('\n💰💰💰 TOTAL PORTFOLIO VALUE (ALL VAULTS): $' + total.toFixed(2) + ' 💰💰💰');
        console.log('This is the sum of ALL your vaults, not just current vault');
        console.log('Number of vaults included:', allVaultsData.length);
        setTotalUSD(total);
        
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoadingPrices(false);
      }
    };

    if (allVaultsData.length > 0) {
      fetchPricesAndCalculate();
      const interval = setInterval(fetchPricesAndCalculate, 120000);
    return () => clearInterval(interval);
    }
  }, [allVaultsData, onSolPriceChange]);

  const copyAddress = () => {
    navigator.clipboard.writeText(vaultAddress);
    toast.success("Vault address copied!");
  };

  const solAmount = (solBalance / LAMPORTS_PER_SOL);
  const shortAddress = `${vaultAddress.slice(0, 6)}...${vaultAddress.slice(-6)}`;
  
  // Calculate total portfolio value in SOL equivalent
  const totalPortfolioInSOL = solPrice > 0 ? totalUSD / solPrice : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-6"
    >
      {/* Vault Card - Refined */}
      <div 
        className="relative p-[2px]"
        style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
      >
        {/* Border */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-orange-500/30 to-orange-500/20" />
        
        <div className="
          relative 
          bg-black/80
          backdrop-blur-xl
          p-5 md:p-6
          overflow-hidden
        "
        style={{ clipPath: 'polygon(10px 0, calc(100% - 2px) 0, calc(100% - 2px) calc(100% - 10px), calc(100% - 10px) calc(100% - 2px), 2px calc(100% - 2px), 2px 10px)' }}
      >
        
        {/* Decorative elements - more subtle */}
        <div className="absolute top-0 right-0 w-[2px] h-12 bg-orange-500/50" />
        <div className="absolute bottom-0 left-0 w-[2px] h-16 bg-orange-500/30" />
        
        {/* Label & Vault Selector Row */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-4"
        >
          <h2 className="text-xs text-gray-500 uppercase tracking-widest font-bold">
            Vault
          </h2>
          
          {/* Vault Selector */}
          <VaultSelector currentVaultIndex={vaultIndex} />
        </motion.div>
        
        {/* Balance Display - Tighter */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8, delay: 0.3 }}
          className="mb-5"
        >
          <AnimatedCounter />
          <div className="text-lg font-mono text-gray-500">
            ≈ {formatTokenAmount(totalPortfolioInSOL)} SOL
          </div>
        </motion.div>
      
        {/* Vault Address - Compact */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 mb-5"
        >
          <span className="font-mono text-xs text-gray-500">{shortAddress}</span>
          <motion.button
            whileTap={{ scale: 0.95 }}
          onClick={copyAddress}
            className="text-gray-500 hover:text-orange-500 transition-colors"
          >
            <Copy className="w-3 h-3" />
          </motion.button>
        </motion.div>
        
        {/* Action Buttons - Compact */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3"
        >
          <DepositButton vaultAddress={vaultAddress} vaultIndex={vaultIndex} />
          
          {multisigPda && (
            <SendSol
              rpcUrl={rpcUrl}
              multisigPda={multisigPda}
              vaultIndex={vaultIndex}
              programId={programId}
              asButton={true}
            />
          )}
        </motion.div>
      </div>
      </div>
    </motion.div>
  );
}

