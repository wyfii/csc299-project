"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Wallet } from "lucide-react";
import MultisigOnboarding from "./MultisigOnboarding";
import { useUserOnboarding } from "@/lib/hooks/useUserOnboarding";
import { trackPageView, trackUserAction } from "@/lib/analytics";
import Image from "next/image";

export default function LandingPage() {
  const { connected } = useWallet();
  const walletModal = useWalletModal();
  const router = useRouter();
  const { isNewUser, isLoading } = useUserOnboarding();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCreatingMultisig, setIsCreatingMultisig] = useState(false);

  useEffect(() => {
    // Track page view
    trackPageView('landing_page');
  }, []);

  useEffect(() => {
    // Only show onboarding for NEW users who haven't created a multisig
    console.log("LandingPage state:", { connected, isLoading, isNewUser, showOnboarding });
    
    if (connected && !isLoading) {
      if (isNewUser === true) {
        console.log("📋 New user (no multisig) - showing onboarding");
        setShowOnboarding(true);
      } else if (isNewUser === false) {
        console.log("✅ Existing user (has multisig) - hiding onboarding");
        setShowOnboarding(false);
      }
    }
  }, [connected, isLoading, isNewUser]);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    setIsCreatingMultisig(true);
    
    // Wait a bit for Firestore to propagate and blockchain to confirm
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Refresh to show the new multisig
    router.refresh();
    
    // Wait another moment then clear loading
    setTimeout(() => {
      setIsCreatingMultisig(false);
      router.refresh(); // One more refresh to be sure
    }, 2000);
  };

  // Show loading screen after multisig creation
  if (isCreatingMultisig) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <h2 className="text-xl font-medium text-white mb-2 font-mono">Creating vault...</h2>
        </div>
      </div>
    );
  }

  // Show onboarding modal when connected and user is new
  if (connected && showOnboarding) {
    console.log("🎯 Showing onboarding modal");
    return (
      <MultisigOnboarding
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // If connected but not showing onboarding, don't render anything
  if (connected) {
    console.log("✅ Connected user - LandingPage returns null (main content should show)");
    return null;
  }

  console.log("🌟 Not connected - showing landing page");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center antialiased bg-black">
      {/* Centered Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5,
            delay: 0.2,
            ease: "easeOut"
          }}
          className="bg-zinc-950 border border-zinc-900 p-12 rounded-lg"
        >
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Image
                src="/logo.png"
                alt="Nova"
                width={64}
                height={64}
                className="w-16 h-16 mx-auto"
              />
              <h1 className="logo-text text-4xl font-bold text-white tracking-wider">
                NOVA VAULT
              </h1>
            </div>

            <Button
              onClick={() => walletModal.setVisible(true)}
              className="w-full bg-white text-black hover:bg-gray-200 rounded-full text-xs font-medium py-3 transition-colors"
            >
              CONNECT WALLET
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
