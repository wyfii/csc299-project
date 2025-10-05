import {
  AccountInfo,
  LAMPORTS_PER_SOL,
  ParsedAccountData,
  PublicKey,
  RpcResponseAndContext,
} from "@solana/web3.js";
import { motion } from "framer-motion";
import { ArrowUpRight, Shield, Activity, Copy, Coins, MoreVertical, Send, Flame } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { getTokenLogoUrl, getTokenSymbol } from "@/lib/getTokenImage";
import DecryptedText from "./DecryptedText";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import SendTokens from "./SendTokensButton";
import SendSol from "./SendSolButton";

type TokenListProps = {
  solBalance: number;
  tokens: RpcResponseAndContext<
    {
      pubkey: PublicKey;
      account: AccountInfo<ParsedAccountData>;
    }[]
  >;
  rpcUrl: string;
  multisigPda: string;
  vaultIndex: number;
  programId?: string;
  solPrice?: number;
};

export function TokenList({
  solBalance,
  tokens,
  rpcUrl,
  multisigPda,
  vaultIndex,
  programId,
  solPrice = 0,
}: TokenListProps) {
  const [tokenPrices, setTokenPrices] = useState<{[key: string]: number}>({});
  const [tokenMetadata, setTokenMetadata] = useState<{[key: string]: {symbol: string, logo: string}}>({});
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  const solAmount = (solBalance / LAMPORTS_PER_SOL);
  const solValue = solAmount * solPrice;

  console.log('📊 TokenList render:');
  console.log('  solPrice from props:', solPrice);
  console.log('  solBalance:', solBalance);
  console.log('  solAmount:', solAmount);
  console.log('  solValue (amount * price):', solValue);
  console.log('  tokens count:', tokens.value.length);
  console.log('  tokenPrices:', tokenPrices);

  // Copy token address to clipboard
  const copyTokenAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Token address copied!");
  };

  // Handle image error
  const handleImageError = (mint: string) => {
    setImageErrors(prev => ({ ...prev, [mint]: true }));
  };

  // Format large numbers with commas and proper abbreviations
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
        maximumFractionDigits: 4 
      });
    } else {
      return num.toLocaleString('en-US', { 
        minimumFractionDigits: 4, 
        maximumFractionDigits: 6 
      });
    }
  };

  const formatUSDValue = (value: number): string => {
    return value.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Fetch token prices from multiple sources
  useEffect(() => {
    const fetchTokenPrices = async () => {
      if (tokens.value.length === 0) return;
      
      try {
        const mintAddresses = tokens.value.map((token: any) => 
          token.account.data.parsed.info.mint
        );
        
        console.log('Fetching token prices for:', mintAddresses);
        
        // Try Jupiter API first
        try {
          const allIds = mintAddresses.join(',');
          const jupiterResponse = await fetch(`https://price.jup.ag/v6/price?ids=${allIds}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (compatible; TrenchInsurance/1.0)'
            }
          });
          
          if (jupiterResponse.ok) {
            const jupiterData = await jupiterResponse.json();
            console.log('Jupiter token price data:', jupiterData);
            
            const tokenPriceMap: {[key: string]: number} = {};
            Object.entries(jupiterData.data || {}).forEach(([key, value]: [string, any]) => {
              tokenPriceMap[key] = value.price;
            });
            
            setTokenPrices(tokenPriceMap);
            console.log('Token prices from Jupiter:', tokenPriceMap);
          }
        } catch (jupiterError) {
          console.error('Jupiter API failed for tokens:', jupiterError);
          
          // Fallback: Try CoinGecko for individual tokens
          const tokenPriceMap: {[key: string]: number} = {};
          for (const mint of mintAddresses) {
            try {
              await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to avoid rate limits
              const cgResponse = await fetch(`https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${mint}&vs_currencies=usd`);
              if (cgResponse.ok) {
                const cgData = await cgResponse.json();
                if (cgData[mint]?.usd) {
                  tokenPriceMap[mint] = cgData[mint].usd;
                  console.log(`CoinGecko price for ${mint}:`, cgData[mint].usd);
                }
              }
            } catch (tokenError) {
              console.log(`No CoinGecko price found for ${mint}:`, tokenError);
            }
          }
          
          setTokenPrices(tokenPriceMap);
          console.log('Token prices from CoinGecko fallback:', tokenPriceMap);
        }
        
      } catch (error) {
        console.error('Error fetching token prices:', error);
      }
    };

    fetchTokenPrices();
    const interval = setInterval(fetchTokenPrices, 120000); // Update every 2 minutes
    return () => clearInterval(interval);
  }, [tokens]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Header - Compact */}
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-orange-500" />
        <h2 className="text-sm font-bold text-white uppercase tracking-widest">
          Holdings
        </h2>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-orange-500/30 to-transparent" />
      </div>

      <div className="space-y-2">
        {/* SOL Asset Card - Compact */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="
            relative group
            bg-transparent
            border border-gray-800/50
            backdrop-blur-sm px-5 py-4
            transition-all duration-200
            hover:bg-gray-900/30 hover:border-gray-600
            overflow-hidden
          "
          style={{ 
            clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
          }}
        >
          {/* Content - Horizontal Layout */}
          <div className="flex items-center justify-between gap-4">
            {/* Token Icon and Info */}
            <div className="flex items-center gap-4">
              {/* SOL Icon */}
              <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                <Image 
                  src="/sol-logo.png" 
                  alt="SOL" 
                  width={32} 
                  height={32}
                  className="w-8 h-8 object-contain"
                />
              </div>
              
              {/* Token Symbol */}
              <span className="text-sm text-gray-400 uppercase tracking-wider font-semibold min-w-[60px]">SOL</span>
              
              {/* Token Amount */}
              <span className="font-mono text-base font-semibold text-white">
                {formatTokenAmount(solAmount)}
              </span>
              
              {/* USD Value */}
              <span className="text-sm text-gray-500 min-w-[80px]">
                {formatUSDValue(solValue)}
              </span>
            </div>
            
            {/* 3-Dot Menu */}
            <Popover>
              <PopoverTrigger asChild>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-500 hover:text-gray-300 transition-colors p-1"
                >
                  <MoreVertical className="w-4 h-4" />
                </motion.button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-44 p-1 bg-black border-none"
                style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                align="end"
              >
                {/* Border wrapper */}
                <div 
                  className="relative p-[2px] bg-gradient-to-r from-trench-orange to-orange-500"
                  style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                >
                  <div 
                    className="bg-black py-1"
                    style={{ clipPath: 'polygon(4px 0, calc(100% - 2px) 0, calc(100% - 2px) calc(100% - 4px), calc(100% - 4px) calc(100% - 2px), 2px calc(100% - 2px), 2px 4px)' }}
                  >
                    {/* Send action */}
                    <div className="px-1">
                      <SendSol
                        rpcUrl={rpcUrl}
                        multisigPda={multisigPda}
                        vaultIndex={vaultIndex}
                        programId={programId}
                        asMenuItem={true}
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </motion.div>

        {/* Token Assets */}
        {tokens.value.map((token, index) => {
          const mintAddress = token.account.data.parsed.info.mint;
          const amount = token.account.data.parsed.info.tokenAmount.uiAmount || 0;
          const shortMint = `${mintAddress.slice(0, 8)}...${mintAddress.slice(-6)}`;
          const price = tokenPrices[mintAddress] || 0;
          const usdValue = amount * price;
          const tokenImageUrl = getTokenLogoUrl(mintAddress);
          const tokenSymbol = getTokenSymbol(mintAddress);
          const hasImageError = imageErrors[mintAddress] || false;
          
          // Handle pubkey conversion safely
          const tokenAccount = typeof token.pubkey === 'string' 
            ? token.pubkey 
            : token.pubkey?.toBase58?.() || token.pubkey?.toString() || '';
          
          return (
            <motion.div
              key={mintAddress}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + (index * 0.05) }}
              className="
                relative group
                bg-transparent
                border border-gray-800/50
                backdrop-blur-sm px-5 py-4
                transition-all duration-200
                hover:bg-gray-900/30 hover:border-gray-600
                overflow-hidden
              "
              style={{ 
                clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
              }}
            >
              {/* Content - Horizontal Layout */}
              <div className="flex items-center justify-between gap-4">
                {/* Token Icon and Info */}
                <div className="flex items-center gap-4">
                  {/* Token Icon */}
                  <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                    {!hasImageError && tokenImageUrl ? (
                      <Image 
                        src={tokenImageUrl}
                        alt={tokenSymbol || shortMint}
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain"
                        onError={() => handleImageError(mintAddress)}
                        unoptimized={tokenImageUrl.startsWith('http')}
                      />
                    ) : (
                      <Coins className="w-7 h-7 text-gray-500 group-hover:text-gray-400" />
                    )}
                  </div>
                  
                  {/* Token Symbol */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 uppercase tracking-wider font-semibold min-w-[60px]">
                      {tokenSymbol || 'Token'}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyTokenAddress(mintAddress)}
                      className="text-gray-500 hover:text-orange-500 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </motion.button>
                  </div>
                  
                  {/* Token Amount */}
                  <span className="font-mono text-base font-semibold text-white">
                    {formatTokenAmount(amount)}
                  </span>
                  
                  {/* USD Value */}
                  <span className="text-sm text-gray-500 min-w-[80px]">
                    {price > 0 ? formatUSDValue(usdValue) : '$0.00'}
                  </span>
                </div>
                
                {/* 3-Dot Menu */}
                <Popover>
                  <PopoverTrigger asChild>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="text-gray-500 hover:text-gray-300 transition-colors p-1"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </motion.button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-44 p-1 bg-black border-none"
                    style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                    align="end"
                  >
                    {/* Border wrapper */}
                    <div 
                      className="relative p-[2px] bg-gradient-to-r from-trench-orange to-orange-500"
                      style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                    >
                      <div 
                        className="bg-black py-1"
                        style={{ clipPath: 'polygon(4px 0, calc(100% - 2px) 0, calc(100% - 2px) calc(100% - 4px), calc(100% - 4px) calc(100% - 2px), 2px calc(100% - 2px), 2px 4px)' }}
                      >
                        {/* Send action */}
                        <div className="px-1">
                          <SendTokens
                            mint={mintAddress}
                            tokenAccount={tokenAccount}
                            decimals={token.account.data.parsed.info.tokenAmount.decimals}
                            tokenBalance={amount || 0}
                            rpcUrl={rpcUrl}
                            multisigPda={multisigPda}
                            vaultIndex={vaultIndex}
                            programId={programId}
                            asMenuItem={true}
                          />
                        </div>
                        
                        {/* Burn action */}
                        <button
                          className="
                            w-full px-4 py-2 text-left
                            font-button uppercase
                            text-gray-400 hover:text-orange-500 hover:bg-gray-900/50
                            transition-all duration-200
                            flex items-center gap-2
                          "
                          onClick={() => toast.info('Burn functionality coming soon')}
                        >
                          <Flame className="w-3 h-3" />
                          Burn
                        </button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </motion.div>
          );
        })}

        {/* Empty State */}
        {tokens.value.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center py-12"
          >
            <div className="text-gray-500 mb-2">No additional tokens found</div>
            <div className="text-xs text-gray-600 uppercase tracking-widest">All assets displayed above</div>
          </motion.div>
        )}
      </div>

      {/* Stats Footer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 flex items-center justify-between text-xs text-gray-500 uppercase tracking-widest"
      >
        <span>Total Assets: {tokens.value.length + 1}</span>
        <span>Last Updated: {new Date().toLocaleTimeString()}</span>
      </motion.div>
    </motion.div>
  );
}
