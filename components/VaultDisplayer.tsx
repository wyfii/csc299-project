"use client";
import * as multisig from "nova-multisig-sdk";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PublicKey } from "@solana/web3.js";
import { VaultSelector } from "./VaultSelector";
import { Button } from "./ui/button";
import { toast } from "sonner";

type VaultDisplayerProps = {
  multisigPdaString: string;
  vaultIndex: number;
  programId?: string;
};

export function VaultDisplayer({
  multisigPdaString,
  vaultIndex,
  programId,
}: VaultDisplayerProps) {
  const vaultAddress = multisig.getVaultPda({
    multisigPda: new PublicKey(multisigPdaString),
    index: vaultIndex,
    programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
  });

  const vaultAddressString = vaultAddress[0].toBase58();

  const copyAddress = () => {
    navigator.clipboard.writeText(vaultAddressString);
    toast.success("Vault address copied!");
  };

  return (
    <Card className="w-full my-3">
      <CardHeader>
        <CardTitle className="font-sans">Nova Vault - Send Funds Here</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
            <p className="text-xs text-gray-400 mb-2 font-sans">Vault Address (send funds to this address):</p>
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-sm text-white break-all">{vaultAddressString}</p>
              <Button
                onClick={copyAddress}
                size="sm"
                variant="outline"
                className="flex-shrink-0 font-sans"
              >
                Copy
              </Button>
            </div>
          </div>
          <VaultSelector />
        </div>
      </CardContent>
    </Card>
  );
}
