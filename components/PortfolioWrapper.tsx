"use client";
import { useState } from "react";
import { PortfolioValue } from "./PortfolioValue";
import { TokenList } from "./TokenList";

interface PortfolioWrapperProps {
  solBalance: number;
  tokens: any;
  rpcUrl: string;
  vaultAddress: string;
  multisigPda: string;
  vaultIndex: number;
  programId?: string;
}

export function PortfolioWrapper({
  solBalance,
  tokens,
  rpcUrl,
  vaultAddress,
  multisigPda,
  vaultIndex,
  programId,
}: PortfolioWrapperProps) {
  const [solPrice, setSolPrice] = useState(0);

  return (
    <>
      <PortfolioValue
        solBalance={solBalance}
        tokens={tokens}
        rpcUrl={rpcUrl}
        vaultAddress={vaultAddress}
        vaultIndex={vaultIndex}
        multisigPda={multisigPda}
        programId={programId}
        onSolPriceChange={setSolPrice}
      />

      <TokenList
        solBalance={solBalance}
        tokens={tokens}
        rpcUrl={rpcUrl}
        multisigPda={multisigPda}
        vaultIndex={vaultIndex}
        programId={programId}
        solPrice={solPrice}
      />
    </>
  );
}
