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
          <h2 className="text-2xl font-bold text-white mb-2">Creating Your Multisig</h2>
          <p className="text-gray-400">Please wait while we finalize everything...</p>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center antialiased bg-gradient-to-br from-black via-zinc-950 to-black">
      {/* Simple gradient overlay - no animations */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      
      {/* Centered Card */}
      <div className="relative z-10 w-full max-w-md mx-4 opacity-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5,
            delay: 0.2,
            ease: "easeOut"
          }}
          className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 p-12 shadow-2xl rounded-xl"
        >
          <div className="text-center space-y-8">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-white font-sans">
                Welcome to Nova
              </h1>
              <p className="text-gray-400 text-sm font-sans">
                Connect your wallet to access your multisig
              </p>
            </div>

            <Button
              onClick={() => walletModal.setVisible(true)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold text-base py-6 transition-colors font-sans shadow-lg shadow-orange-500/30"
            >
              <Wallet className="w-5 h-5 mr-2" />
              Connect Wallet
            </Button>

            <p className="text-xs text-gray-500 pt-4 font-sans">
              Secure Multisig Wallet
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
