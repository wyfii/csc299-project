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
    <div className="space-y-px">
      {/* SOL Row */}
      <div className="bg-zinc-950/50 border-b border-zinc-900 px-4 py-3 flex items-center justify-between hover:bg-zinc-950 transition-colors">
        <div className="flex items-center gap-4 flex-1">
          <span className="text-white font-medium">SOL</span>
          <span className="text-gray-500">•</span>
          <span className="text-white font-mono">{(solBalance / LAMPORTS_PER_SOL).toFixed(4)}</span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-500">$0.00</span>
        </div>
        <div className="flex gap-2">
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
        const symbol = mintAddress.slice(0, 6);
        
        return (
          <div 
            key={mintAddress}
            className="bg-zinc-950/50 border-b border-zinc-900 px-4 py-3 flex items-center justify-between hover:bg-zinc-950 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <span className="text-white font-medium font-mono">{symbol}</span>
              <span className="text-gray-500">•</span>
              <span className="text-white font-mono">{amount?.toFixed(4) || '0.0000'}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">$0.00</span>
            </div>
            <div className="flex gap-2">
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
