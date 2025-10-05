"use client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Member, createMultisig } from "@/lib/createSquad";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  CheckSquare,
  Copy,
  ExternalLink,
  PlusCircleIcon,
  XIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { isPublickey } from "@/lib/isPublickey";
import { ValidationRules, useSquadForm } from "@/lib/hooks/useSquadForm";
import { useUserOnboarding } from "@/lib/hooks/useUserOnboarding";
import Link from "next/link";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface MemberAddresses {
  count: number;
  memberData: Member[];
}

interface CreateSquadFormData {
  members: MemberAddresses;
  threshold: number;
  rentCollector: string;
  configAuthority: string;
  createKey: string;
  name?: string;
}

export default function CreateSquadForm({
  rpc,
  programId,
}: {
  rpc: string;
  programId: string;
}) {
  const router = useRouter();
  const { publicKey, connected, sendTransaction } = useWallet();
  const { markMultisigCreated } = useUserOnboarding();

  const connection = new Connection(rpc || clusterApiUrl("mainnet-beta"));
  const validationRules = getValidationRules();

  const { formState, handleChange, handleAddMember, onSubmit } = useSquadForm<{
    signature: string;
    multisig: string;
  }>(
    {
      threshold: 1,
      rentCollector: "",
      configAuthority: "",
      createKey: "",
      name: "",
      members: {
        count: 0,
        memberData: [],
      },
    },
    validationRules
  );

  async function submitHandler() {
    if (!connected) throw new Error("Please connect your wallet.");
    try {
      const createKey = Keypair.generate();

      const { transaction, multisig } = await createMultisig(
        connection,
        publicKey!,
        formState.values.members.memberData,
        formState.values.threshold,
        createKey.publicKey,
        formState.values.rentCollector,
        formState.values.configAuthority,
        programId
      );

      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: true,
        signers: [createKey],
      });
      console.log("Transaction signature", signature);
      toast.loading("Confirming...", {
        id: "create",
      });

      let sent = false;
      const maxAttempts = 10;
      const delayMs = 1000;
      for (let attempt = 0; attempt <= maxAttempts && !sent; attempt++) {
        const status = await connection.getSignatureStatus(signature);
        if (status?.value?.confirmationStatus === "confirmed") {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          sent = true;
        } else {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }

      // Multisig is now read from Firestore, no need to set cookie

      // Mark user as having created their first multisig
      await markMultisigCreated();

      // Save record to Firestore with optional name (client path mirrors onboarding)
      try {
        const userRef = doc(db, "users", publicKey!.toBase58());
        await setDoc(
          userRef,
          { hasCreatedMultisig: true, lastLogin: serverTimestamp() },
          { merge: true }
        );
        const multisigRef = doc(db, "users", publicKey!.toBase58(), "multisigs", multisig.toBase58());
        await setDoc(
          multisigRef,
          {
            address: multisig.toBase58(),
            members: formState.values.members.memberData.map((m: Member) => m.key!.toBase58()),
            threshold: formState.values.threshold,
            createdAt: serverTimestamp(),
            createdBy: publicKey!.toBase58(),
            isActive: true,
            name: (formState.values.name || "").trim() || null,
          },
          { merge: true }
        );
      } catch (e) {
        console.error("Failed to save multisig to Firestore:", e);
      }

      return { signature, multisig: multisig.toBase58() };
    } catch (error: any) {
      console.error(error);
      return error;
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      router.refresh();
    }
  }

  return (
    <>
      <div className="grid grid-cols-8 gap-4 mb-6">
        <div className="col-span-8 flex-col space-y-2">
          <label htmlFor="name" className="font-medium">Name</label>
          <Input
            type="text"
            placeholder="e.g. Marketing Vault"
            value={formState.values.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="bg-zinc-800/50"
          />
        </div>
        <div className="col-span-6 flex-col space-y-2">
          <label htmlFor="members" className="font-medium">
            Members <span className="text-red-600">*</span>
          </label>
          {formState.values.members.memberData.map(
            (member: Member, i: number) => (
              <div key={i} className="grid grid-cols-4 items-center gap-2">
                <div className="relative col-span-3">
                  <Input
                    defaultValue={member.key ? member.key.toBase58() : ""}
                    placeholder={`Member key ${i + 1}`}
                    onChange={(e) => {
                      handleChange("members", {
                        count: formState.values.members.count,
                        memberData: formState.values.members.memberData.map(
                          (member: Member, index: number) => {
                            if (index === i) {
                              let newKey = null;
                              try {
                                if (
                                  e.target.value &&
                                  PublicKey.isOnCurve(e.target.value)
                                ) {
                                  newKey = new PublicKey(e.target.value);
                                }
                              } catch (error) {
                                console.error(
                                  "Invalid public key input:",
                                  error
                                );
                              }
                              return {
                                ...member,
                                key: newKey,
                              };
                            }
                            return member;
                          }
                        ),
                      });
                    }}
                  />
                  {i > 0 && (
                    <XIcon
                      onClick={() => {
                        handleChange("members", {
                          count: formState.values.members.count,
                          memberData:
                            formState.values.members.memberData.filter(
                              (_: Member, index: number) => index !== i
                            ),
                        });
                      }}
                      className="absolute inset-y-3 right-2 w-4 h-4 text-zinc-400 hover:text-zinc-600"
                    />
                  )}
                </div>
                <Select
                  defaultValue={member.permissions.mask.toString()}
                  onValueChange={(e: any) => {
                    handleChange("members", {
                      count: formState.values.members.count,
                      memberData: formState.values.members.memberData.map(
                        (member: Member, index: number) => {
                          if (index === i) {
                            return {
                              ...member,
                              permissions: {
                                mask: Number(e),
                              },
                            };
                          }
                          return member;
                        }
                      ),
                    });
                  }}
                >
                  <SelectTrigger className="col-span-1">
                    <SelectValue placeholder="Select permissions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="1">Proposer</SelectItem>
                      <SelectItem value="2">Voter</SelectItem>
                      <SelectItem value="4">Executor</SelectItem>
                      <SelectItem value="7">All</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )
          )}
          <button
            onClick={(e) => handleAddMember(e)}
            className="mt-2 flex gap-1 items-center text-zinc-400 hover:text-zinc-600"
          >
            <PlusCircleIcon className="w-4" />
            <p className="text-sm">Add Address</p>
          </button>
          {formState.errors.members && (
            <div className="mt-1.5 text-red-500 text-xs">
              {formState.errors.members}
            </div>
          )}
        </div>
        <div className="col-span-4 flex-col space-y-2">
          <label htmlFor="threshold" className="font-medium">
            Threshold <span className="text-red-600">*</span>
          </label>
          <Input
            type="number"
            placeholder="Auto-set to number of members (all must approve)"
            value={formState.values.threshold}
            onChange={(e) =>
              handleChange("threshold", parseInt(e.target.value))
            }
            className="bg-zinc-800/50"
          />
          <p className="text-xs text-zinc-400">
            Currently set to {formState.values.threshold} - all members must approve. You can manually adjust if needed.
          </p>
          {formState.errors.threshold && (
            <div className="mt-1.5 text-red-500 text-xs">
              {formState.errors.threshold}
            </div>
          )}
        </div>
        <div className="col-span-4 flex-col space-y-2">
          <label htmlFor="rentCollector" className="font-medium">
            Rent Collector
          </label>
          <Input
            type="text"
            placeholder="Optional rent collector"
            defaultValue={formState.values.rentCollector}
            onChange={(e) => handleChange("rentCollector", e.target.value)}
            className=""
          />
          {formState.errors.rentCollector && (
            <div className="mt-1.5 text-red-500 text-xs">
              {formState.errors.rentCollector}
            </div>
          )}
        </div>
        <div className="col-span-4 flex-col space-y-2">
          <label htmlFor="configAuthority" className="font-medium">
            Config Authority
          </label>
          <Input
            type="text"
            placeholder="Optional config authority"
            defaultValue={formState.values.configAuthority}
            onChange={(e) => handleChange("configAuthority", e.target.value)}
            className=""
          />
          {formState.errors.configAuthority && (
            <div className="mt-1.5 text-red-500 text-xs">
              {formState.errors.configAuthority}
            </div>
          )}
        </div>
      </div>
      <Button
        onClick={() =>
          toast.promise(onSubmit(submitHandler), {
            id: "create",
            duration: 10000,
            loading: "Building Transaction...",
            success: (res) => (
              <div className="w-full flex items-center justify-between">
                <div className="flex gap-4 items-center">
                  <CheckSquare className="w-4 h-4 text-green-600" />
                  <div className="flex flex-col space-y-0.5">
                    <p className="font-semibold">
                      Multisig Created:{" "}
                      <span className="font-normal">
                        {res.multisig.slice(0, 4) +
                          "..." +
                          res.multisig.slice(-4)}
                      </span>
                    </p>
                    <p className="font-light">
                      Your new multisig has been set as active.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Copy
                    onClick={() => {
                      navigator.clipboard.writeText(res.multisig);
                      toast.success("Copied address!");
                    }}
                    className="w-4 h-4 hover:text-stone-500"
                  />
                  <Link
                    href={`https://solscan.io/account/${res.multisig}`}
                    target="_blank"
                    rel="noreferrer"
                    passHref
                  >
                    <ExternalLink className="w-4 h-4 hover:text-stone-500" />
                  </Link>
                </div>
              </div>
            ),
            error: (e) => `Failed to create multisig: ${e}`,
          })
        }
      >
        Create Multisig
      </Button>
    </>
  );
}

function getValidationRules(): ValidationRules {
  return {
    threshold: async (value: number) => {
      if (value < 1) return "Threshold must be greater than 0";
      return null;
    },
    rentCollector: async (value: string) => {
      const valid = isPublickey(value);
      if (!valid) return "Rent collector must be a valid public key";
      return null;
    },
    configAuthority: async (value: string) => {
      const valid = isPublickey(value);
      if (!valid) return "Config authority must be a valid public key";
      return null;
    },
    members: async (value: { count: number; memberData: Member[] }) => {
      if (value.count < 1) return "At least one member is required";

      const valid = await Promise.all(
        value.memberData.map(async (member) => {
          if (member.key == null) return "Invalid Member Key";
          const valid = isPublickey(member.key.toBase58());
          if (!valid) return "Invalid Member Key";
          return null;
        })
      );

      if (valid.includes("Invalid Member Key")) {
        let index = valid.findIndex((v) => v === "Invalid Member Key");
        return `Member ${index + 1} is invalid`;
      }

      return null;
    },
  };
}
