"use client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Users, Shield, Check, ArrowRight, ArrowLeft, Sparkles, Wallet, AlertCircle, PlusCircle as PlusCircleIcon, X as XIcon, Coins } from "lucide-react";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, Keypair, PublicKey, clusterApiUrl, Transaction } from "@solana/web3.js";
import { createMultisig, Member } from "@/lib/createSquad";
import { HARDCODED_RPC_URL, OFFICIAL_PROGRAM_ID } from "@/lib/utils";
import { toast } from "sonner";
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import * as multisig from "nova-multisig-sdk";
import NVAIBurnOption from "./NVAIBurnOption";
import { getTokenImage } from "@/lib/getTokenImage";
import { MULTISIG_CREATION_COST_SOL, getNVAIPriceInSOL, calculateNVAIToBurn } from "@/lib/getNVAIPrice";
import { trackMultisigCreated, trackUserAction, trackError } from "@/lib/analytics";
import Image from "next/image";

interface MultisigOnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
}

interface MemberData {
  address: string;
  isValid: boolean;
  error?: string;
}

// Removed heavy animations for better performance

export default function MultisigOnboarding({ isOpen, onComplete }: MultisigOnboardingProps) {
  const [step, setStep] = useState(0);
  const [members, setMembers] = useState<MemberData[]>([
    { address: "", isValid: false },
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [useNVAIPayment, setUseNVAIPayment] = useState(false);
  const { publicKey, sendTransaction } = useWallet();

  const validateAddress = (address: string, currentIndex: number): { isValid: boolean; error?: string } => {
    if (!address.trim()) {
      return { isValid: false, error: "Address is required" };
    }
    try {
      const pubkey = new PublicKey(address);
      if (!PublicKey.isOnCurve(pubkey.toBytes())) {
        return { isValid: false, error: "Invalid Solana address" };
      }
      // Check for duplicates (but allow same address in different fields)
      const isDuplicate = members.some((m, idx) => m.address === address && idx !== currentIndex && m.address !== "");
      if (isDuplicate) {
        return { isValid: false, error: "Duplicate address" };
      }
      return { isValid: true };
    } catch {
      return { isValid: false, error: "Invalid address format" };
    }
  };

  const handleMemberChange = (index: number, value: string) => {
    const newMembers = [...members];
    const validation = validateAddress(value, index);
    newMembers[index] = {
      address: value,
      isValid: validation.isValid,
      error: validation.error,
    };
    setMembers(newMembers);
  };

  const canProceedToCreation = members.length >= 1 && members.every(m => m.isValid && m.address.trim() !== "");
  
  const addMember = () => {
    if (members.length < 3) {
      setMembers([...members, { address: "", isValid: false }]);
    }
  };

  const removeMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const createMultisigWallet = async () => {
    if (!publicKey || !canProceedToCreation) return;

    setIsCreating(true);
    try {
      // Get RPC URL from env
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || HARDCODED_RPC_URL;
      // Using RPC URL for connection
      // Payment method selected
      
      const connection = new Connection(rpcUrl, {
        commitment: "confirmed",
      } as any);
      
      // Test connection first
      console.log("Testing RPC connection...");
      const slot = await connection.getSlot();
      console.log("✅ RPC connected! Current slot:", slot);

      // Prepare members with permissions
      // Collect all unique addresses (including user's wallet if not already in members)
      const memberAddresses = members.map(m => m.address);
      const allUniqueAddresses = new Set([publicKey.toBase58(), ...memberAddresses]);
      
      const allMembers: Member[] = Array.from(allUniqueAddresses).map(addr => ({
        key: new PublicKey(addr),
        permissions: { mask: 7 }, // All permissions
      }));

      const createKey = Keypair.generate();
      const totalMembers = allMembers.length;
      const threshold = totalMembers; // All members must approve

      if (useNVAIPayment) {
        // NVAI Burn flow - VALIDATE FIRST, then burn
        toast.loading("🔍 Validating multisig creation...", { id: "create-multisig" });
        
        // Calculate NVAI to burn
        const nvaiPrice = await getNVAIPriceInSOL();
        const nvaiToBurn = calculateNVAIToBurn(MULTISIG_CREATION_COST_SOL, nvaiPrice);
        
        console.log("💰 NVAI Payment Details:", {
          nvaiPrice,
          solCost: MULTISIG_CREATION_COST_SOL,
          nvaiToBurn,
        });

        // Create multisig instruction first (to validate)
        const multisigPda = multisig.getMultisigPda({
          createKey: createKey.publicKey,
          programId: new PublicKey(OFFICIAL_PROGRAM_ID),
        })[0];

        const [programConfig] = multisig.getProgramConfigPda({
          programId: new PublicKey(OFFICIAL_PROGRAM_ID),
        });

        const programConfigInfo = await multisig.accounts.ProgramConfig.fromAccountAddress(
          connection,
          programConfig
        );

        const configTreasury = programConfigInfo.treasury;

        // Create multisig instruction
        const multisigIx = multisig.instructions.multisigCreateV2({
          multisigPda: multisigPda,
          createKey: createKey.publicKey,
          creator: publicKey, // User is creator
          members: allMembers as any,
          threshold: threshold,
          configAuthority: null,
          treasury: configTreasury,
          rentCollector: null,
          timeLock: 0,
          programId: new PublicKey(OFFICIAL_PROGRAM_ID),
        });

        console.log('✅ Multisig instruction prepared');
        // Testing admin API availability
        
        // Test admin API first (before burning NVAI)
        const testResponse = await fetch('/api/admin-create-multisig', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            multisigPda: multisigPda.toBase58(),
            createKeyPublic: createKey.publicKey.toBase58(),
            createKeySecret: Array.from(createKey.secretKey),
            members: allMembers.map(m => ({
              key: m.key!.toBase58(),
              permissions: m.permissions,
            })),
            threshold: threshold,
            userWallet: publicKey.toBase58(),
            programId: OFFICIAL_PROGRAM_ID,
            dryRun: true, // Test mode
          }),
        });

        if (!testResponse.ok) {
          const errorData = await testResponse.json().catch(() => ({ error: 'Unknown error' }));
          console.error('❌ Admin API Test Failed:', errorData);
          throw new Error(`Cannot create multisig: ${errorData.error || 'Admin API unavailable'}`);
        }
        
        // Admin API is ready
        console.log('🔥 Now burning NVAI (safe to proceed)...');
        
        // Import burn modules
        const { getAssociatedTokenAddress, createBurnCheckedInstruction, TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
        const { NVAI_MINT_ADDRESS, NVAI_DECIMALS } = await import("@/lib/getNVAIPrice");
        
        toast.loading("🔥 Burning NVAI...", { id: "create-multisig" });
        
        // Get user's NVAI token account
        const nvaiATA = await getAssociatedTokenAddress(
          new PublicKey(NVAI_MINT_ADDRESS),
          publicKey
        );
        
        // Calculate burn amount
        const burnAmount = BigInt(Math.round(nvaiToBurn * 10 ** NVAI_DECIMALS));
        
        // Create burn instruction
        const burnIx = createBurnCheckedInstruction(
          nvaiATA,
          new PublicKey(NVAI_MINT_ADDRESS),
          publicKey,
          burnAmount,
          NVAI_DECIMALS,
          [],
          TOKEN_PROGRAM_ID
        );

        // User signs burn transaction
        const burnTx = new Transaction().add(burnIx);
        burnTx.feePayer = publicKey;
        burnTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        toast.loading("Please approve NVAI burn in your wallet...", { id: "create-multisig" });
        
        const burnSig = await sendTransaction(burnTx, connection);
        
        toast.loading("Confirming NVAI burn...", { id: "create-multisig" });
        await connection.confirmTransaction(burnSig, "confirmed");
        
        // NVAI burned successfully
        
        // NOW call admin API for real
        toast.loading("Admin creating your multisig...", { id: "create-multisig" });
        // Calling admin API to create multisig
        
        const adminResponse = await fetch('/api/admin-create-multisig', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            multisigPda: multisigPda.toBase58(),
            createKeyPublic: createKey.publicKey.toBase58(),
            createKeySecret: Array.from(createKey.secretKey),
            members: allMembers.map(m => ({
              key: m.key!.toBase58(),
              permissions: m.permissions,
            })),
            threshold: threshold,
            userWallet: publicKey.toBase58(),
            programId: OFFICIAL_PROGRAM_ID,
            dryRun: false, // Real creation
          }),
        });

        if (!adminResponse.ok) {
          const errorData = await adminResponse.json().catch(() => ({ error: 'Unknown error' }));
          console.error('❌ Admin API Error:', errorData);
          throw new Error(`Admin API failed: ${errorData.error || 'Unknown error'}`);
        }

        const { signature } = await adminResponse.json();
        // Multisig created by admin successfully
        
        const newMultisigAddress = multisigPda.toBase58();
        
        toast.success(
          <div className="flex flex-col gap-1">
            <span>Multisig created successfully! 🎉</span>
            <a 
              href={`https://solscan.io/tx/${signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 underline text-xs"
            >
              View creation tx on Solscan →
            </a>
          </div>,
          { id: "create-multisig", duration: 10000 }
        );
        
        // Continue with Firestore save... (same as SOL flow)
        const userRef = doc(db, "users", publicKey.toBase58());
        await setDoc(userRef, {
          hasCreatedMultisig: true,
          lastLogin: serverTimestamp(),
        }, { merge: true });

        const multisigRef = doc(db, "users", publicKey.toBase58(), "multisigs", multisigPda.toBase58());
        await setDoc(multisigRef, {
          address: multisigPda.toBase58(),
          members: allMembers.map(m => m.key!.toBase58()),
          threshold: threshold,
          createdAt: serverTimestamp(),
          createdBy: publicKey.toBase58(),
          paymentMethod: "NVAI_BURN",
        });

        localStorage.setItem(`nova-user-${publicKey.toBase58()}`, "true");
        
        // Track successful multisig creation
        trackMultisigCreated('NVAI', members.length);
        trackUserAction('multisig_creation_success', { method: 'NVAI', memberCount: members.length });
        
        toast.success("✅ Multisig created with NVAI burn!", { id: "create-multisig", duration: 3000 });
        
        // Wait a moment for everything to propagate
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        onComplete();
        return;
      }

      // Standard SOL payment flow
      toast.loading("Creating your Multisig...", { id: "create-multisig" });

      const { transaction, multisig: multisigPda } = await createMultisig(
        connection,
        publicKey,
        allMembers,
        threshold,
        createKey.publicKey,
        "", // No rent collector
        "", // No config authority
        OFFICIAL_PROGRAM_ID
      );

      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: true,
        signers: [createKey],
      });

      // Wait for confirmation
      await connection.confirmTransaction(signature, "confirmed");

      const newMultisigAddress = multisigPda.toBase58();
      // Multisig created successfully
      
      // Show success with Solscan link
      toast.success(
        <div className="flex flex-col gap-1">
          <span>Multisig created successfully! 🎉</span>
          <a 
            href={`https://solscan.io/tx/${signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-400 hover:text-orange-300 underline text-xs"
          >
            View creation tx on Solscan →
          </a>
        </div>,
        { id: "create-multisig", duration: 10000 }
      );
      // Saving multisig to Firestore

      // Save to Firebase - Update user document
      const userRef = doc(db, "users", publicKey.toBase58());
      
      try {
        await setDoc(
          userRef,
          {
            hasCreatedMultisig: true,
            lastLogin: serverTimestamp(),
          },
          { merge: true }
        );
        console.log("✅ User document updated in Firebase");
      } catch (fbError: any) {
        console.error("❌ Failed to update user document:", fbError.message);
      }

      // Save multisig in subcollection with all details
      const multisigRef = doc(db, "users", publicKey.toBase58(), "multisigs", multisigPda.toBase58());
      console.log("💾 Saving multisig to subcollection:", multisigPda.toBase58());
      
      try {
        await setDoc(multisigRef, {
          address: multisigPda.toBase58(),
          members: allMembers.map(m => m.key!.toBase58()),
          threshold: threshold,
          createdAt: serverTimestamp(),
          createdBy: publicKey.toBase58(),
          isActive: true,
        });
        console.log("✅ Multisig saved to subcollection!");
      } catch (fbError: any) {
        console.error("❌ Failed to save multisig to subcollection:", fbError.message);
      }

      // Track successful multisig creation
      trackMultisigCreated('SOL', members.length);
      trackUserAction('multisig_creation_success', { method: 'SOL', memberCount: members.length });

      toast.success("Multisig created successfully! 🎉", { id: "create-multisig" });

      // Wait for everything to propagate before completing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
        onComplete();
    } catch (error: any) {
      console.error("Error creating multisig:", error);
      
      // Track error
      trackError('multisig_creation_failed', error.message, 'MultisigOnboarding');
      trackUserAction('multisig_creation_error', { 
        error: error.message, 
        method: useNVAIPayment ? 'NVAI' : 'SOL',
        memberCount: members.length 
      });
      
      toast.error(`Failed to create Multisig: ${error.message}`, { id: "create-multisig" });
      setIsCreating(false);
    }
  };

  const steps = [
    {
      title: "Create Multisig",
      subtitle: "Add members to your wallet",
      icon: Users,
      content: (
        <div className="flex flex-col items-center justify-center py-8 space-y-8">
          <Image
            src="/logo.png"
            alt="Nova"
            width={96}
            height={96}
            className="w-20 h-20 md:w-24 md:h-24"
          />
          <div className="text-center space-y-2">
            <p className="text-gray-400 text-sm">
              Multi-signature wallet for shared control
            </p>
          </div>
            </div>
      ),
    },
    {
      title: "Members",
      subtitle: `${members.length} of 3 members`,
      icon: Users,
      content: (
        <div className="space-y-4">

          {members.map((member, index) => (
            <div
              key={index}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-400 font-mono">
                  Member {index + 1}
                </label>
                {members.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMember(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-2"
                  >
                    <XIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Input
                value={member.address}
                onChange={(e) => handleMemberChange(index, e.target.value)}
                placeholder="Wallet address"
                className={`font-mono text-xs bg-black border-zinc-800 ${
                  member.address && !member.isValid
                    ? "border-red-500/50 focus-visible:ring-red-500/50"
                    : member.isValid
                    ? "border-orange-500/50 focus-visible:ring-orange-500/50"
                    : ""
                }`}
              />
              {member.address && !member.isValid && member.error && (
                <p
                  className="text-xs text-red-400 font-sans"
                >
                  {member.error}
                </p>
              )}
              {member.isValid && (
                <p
                  className="text-xs text-orange-400 font-mono flex items-center"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Valid
                </p>
              )}
            </div>
          ))}

          {members.length < 3 && (
              <Button
                onClick={addMember}
                variant="outline"
              className="w-full border-dashed border-zinc-800 hover:border-orange-500/50 hover:bg-black font-mono text-xs"
              >
                <PlusCircleIcon className="w-4 h-4 mr-2" />
              Add member
              </Button>
          )}
        </div>
      ),
    },
    {
      title: "Payment",
      subtitle: "Select payment method",
      icon: Coins,
      content: (
        <div  className="space-y-6">
          <div  className="space-y-4">
            {/* Standard SOL Payment */}
            <div
              className={`
                p-6 rounded-xl border-2 cursor-pointer transition-all
                ${!useNVAIPayment 
                  ? 'bg-zinc-800/50 border-orange-500 shadow-lg shadow-orange-500/20' 
                  : 'bg-zinc-800/30 border-zinc-700 hover:border-zinc-600'
                }
              `}
              onClick={() => setUseNVAIPayment(false)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12">
                  {getTokenImage("SOL", 48)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">Pay with SOL</h3>
                  <p className="text-xs text-gray-400">Standard payment method</p>
                  <p className="text-sm text-white mt-2">
                    Cost: <span className="font-bold text-orange-400">~{MULTISIG_CREATION_COST_SOL} SOL</span>
                  </p>
                </div>
                {!useNVAIPayment && (
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* NVAI Burn Option */}
            <NVAIBurnOption
              selected={useNVAIPayment}
              onSelect={(use) => setUseNVAIPayment(use)}
            />
          </div>

        </div>
      ),
    },
    {
      title: "Confirm",
      subtitle: "Review and create",
      icon: Check,
      content: (
        <div  className="space-y-6">
          <div  className="bg-zinc-800/50 rounded-lg p-4 md:p-6 space-y-4">
            <h4 className="font-semibold text-white font-sans flex items-center text-sm md:text-base">
              <Users className="w-4 h-4 md:w-5 md:h-5 mr-2 text-orange-500" />
              Multisig Members ({Array.from(new Set([publicKey?.toBase58(), ...members.map(m => m.address)])).length} total)
            </h4>
            <div className="space-y-2">
              {Array.from(new Set([publicKey?.toBase58(), ...members.map(m => m.address)])).map((addr, index) => {
                const isCreator = addr === publicKey?.toBase58();
                return (
                  <div
                    key={addr}
                    className={`flex items-center justify-between p-2 md:p-3 rounded-lg ${
                      isCreator 
                        ? "bg-orange-500/10 border border-orange-500/20" 
                        : "bg-zinc-700/50"
                    }`}
                  >
                    <span className="text-xs md:text-sm text-gray-300 font-mono truncate mr-2">
                      {addr?.slice(0, 4)}...{addr?.slice(-4)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded font-sans font-semibold whitespace-nowrap ${
                      isCreator 
                        ? "bg-orange-500 text-black" 
                        : "text-gray-400"
                    }`}>
                      {isCreator ? "You" : `#${index}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div  className="bg-zinc-800/50 rounded-lg p-4 md:p-6">
            <h4 className="font-semibold text-white font-sans flex items-center mb-2 text-sm md:text-base">
              <Shield className="w-4 h-4 md:w-5 md:h-5 mr-2 text-orange-500" />
              Approval Threshold
            </h4>
            <p className="text-gray-300 font-sans text-sm md:text-base">
              <span className="text-xl md:text-2xl font-bold text-orange-500">
                {Array.from(new Set([publicKey?.toBase58(), ...members.map(m => m.address)])).length} out of {Array.from(new Set([publicKey?.toBase58(), ...members.map(m => m.address)])).length}
              </span>{" "}
              approvals required
            </p>
            <p className="text-xs text-gray-500 mt-2 font-sans">
              (All members must approve for maximum security)
            </p>
          </div>

          <div  className="bg-zinc-800/50 rounded-lg p-4 md:p-6">
            <h4 className="font-semibold text-white font-sans flex items-center mb-2 text-sm md:text-base">
              <Coins className="w-4 h-4 md:w-5 md:h-5 mr-2 text-orange-500" />
              Payment Method
            </h4>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              {useNVAIPayment ? (
                <>
                  <div className="flex items-center gap-2">
                    {getTokenImage("3SkFJRqMPTKZLqKK1MmY2mvAm711FGAtJ9ZbL6r1coin", 20)}
                    <span className="text-orange-400 font-bold text-sm md:text-base">NVAI Burn</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    {getTokenImage("SOL", 20)}
                    <span className="text-white font-bold text-sm md:text-base">SOL Payment</span>
                  </div>
                  <span className="text-gray-400 text-xs">(~{MULTISIG_CREATION_COST_SOL} SOL)</span>
                </>
              )}
            </div>
          </div>

          <div  className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-sm text-blue-200 font-sans">
              💡 Once created, you can propose transactions that will need{" "}
              {Array.from(new Set([publicKey?.toBase58(), ...members.map(m => m.address)])).length} approvals (all members) before execution.
              All members can view pending proposals.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[step];
  const Icon = currentStepData.icon;

  return (
    <div>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center overflow-y-auto antialiased bg-black">
          {/* Modal - Mobile responsive */}
          <div
            className="relative w-full max-w-2xl bg-black border-0 md:border border-zinc-900 overflow-hidden md:rounded-none my-0 md:my-8 min-h-screen md:min-h-0"
          >
            {/* Progress Bar */}
            <div className="h-px bg-zinc-900">
              <div
                className="h-full bg-orange-500"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>

            {/* Content */}
            <div className="p-4 md:p-8 pb-6 md:pb-8">
              <div >
                <div
                  key={step}
                  className="space-y-6"
                >
                  {/* Icon & Title */}
                  <div className="text-center space-y-1">
                    <h2 className="text-xl md:text-2xl font-medium text-white font-mono">
                      {currentStepData.title}
                    </h2>
                    <p className="text-xs md:text-sm text-gray-600 font-mono">{currentStepData.subtitle}</p>
                  </div>

                  {/* Step Content */}
                  <div className="py-4">{currentStepData.content}</div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0 pt-4">
                    {step > 0 ? (
                      <Button
                        variant="ghost"
                        onClick={() => setStep(step - 1)}
                        disabled={isCreating}
                        className="font-mono text-xs w-full sm:w-auto border border-zinc-900 hover:bg-zinc-950"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                    ) : (
                      <div className="hidden sm:block" />
                    )}

                    {step < steps.length - 1 ? (
                      <Button
                        onClick={() => setStep(step + 1)}
                        disabled={(step === 1 && !canProceedToCreation)}
                        className="bg-orange-500 hover:bg-orange-600 text-black font-mono text-xs px-6 w-full sm:w-auto"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={createMultisigWallet}
                        disabled={isCreating}
                        className="bg-orange-500 hover:bg-orange-600 text-black font-mono text-xs px-8 w-full sm:w-auto"
                      >
                        {isCreating ? (
                          <>
                            <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                            Creating...
                          </>
                        ) : (
                          <>
                            Create
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
