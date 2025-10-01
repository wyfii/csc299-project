import {
  AccountInfo,
  LAMPORTS_PER_SOL,
  ParsedAccountData,
  PublicKey,
  RpcResponseAndContext,
} from "@solana/web3.js";
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
};

export function TokenList({
  solBalance,
  tokens,
  rpcUrl,
  multisigPda,
  vaultIndex,
  programId,
}: TokenListProps) {
  return (
    <div className="space-y-2">
      {/* SOL Row */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 flex items-center justify-between hover:border-zinc-800 transition-colors">
        <div className="flex-1">
          <div className="flex items-baseline gap-3">
            <span className="text-white font-medium text-base">SOL</span>
            <span className="text-gray-500 text-xs">Solana</span>
          </div>
          <p className="text-gray-400 text-sm mt-1 font-mono">
            {(solBalance / LAMPORTS_PER_SOL).toFixed(4)}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white text-black hover:bg-gray-200 rounded-full px-4 py-1.5 text-xs font-medium transition-colors">
            DEPOSIT
          </button>
          <SendSol
            rpcUrl={rpcUrl}
            multisigPda={multisigPda}
            vaultIndex={vaultIndex}
            programId={programId}
          />
        </div>
      </div>

      {/* Token Rows */}
      {tokens.value.map((token) => {
        const mintAddress = token.account.data.parsed.info.mint;
        const amount = token.account.data.parsed.info.tokenAmount.uiAmount;
        const shortMint = `${mintAddress.slice(0, 4)}...${mintAddress.slice(-4)}`;
        
        return (
          <div 
            key={mintAddress}
            className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 flex items-center justify-between hover:border-zinc-800 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-baseline gap-3">
                <span className="text-white font-medium text-base font-mono">{shortMint}</span>
                <span className="text-gray-500 text-xs">Token</span>
              </div>
              <p className="text-gray-400 text-sm mt-1 font-mono">
                {amount?.toFixed(4) || '0.0000'}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="bg-white text-black hover:bg-gray-200 rounded-full px-4 py-1.5 text-xs font-medium transition-colors">
                DEPOSIT
              </button>
              <SendTokens
                mint={mintAddress}
                tokenAccount={token.pubkey.toBase58()}
                decimals={token.account.data.parsed.info.tokenAmount.decimals}
                tokenBalance={amount || 0}
                rpcUrl={rpcUrl}
                multisigPda={multisigPda}
                vaultIndex={vaultIndex}
                programId={programId}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
