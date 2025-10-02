"use client";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import LandingPage from "./LandingPage";
import EmptyMultisigState from "./EmptyMultisigState";

interface RenderRouteProps {
  multisig: boolean;
  children: React.ReactNode;
}

export default function RenderMultisigRoute({
  multisig,
  children,
}: RenderRouteProps) {
  const pathname = usePathname();
  const { connected } = useWallet();

  console.log("🔍 RenderMultisigRoute:", { connected, multisig, pathname });

  if (connected && multisig) {
    console.log("✅ Rendering children (multisig found)");
  } else if (connected && !multisig) {
    console.log("⚠️ No multisig found - user should create one via onboarding");
  }

  return (
    <>
      {/* Always render LandingPage - it handles onboarding for new users */}
      <LandingPage />
      
      {/* Only show main content when wallet is connected AND has multisig */}
      {connected && multisig && (
        <div className="w-full space-y-2 p-3 pt-4 mt-1 md:space-y-4 md:p-8 md:pt-6 pb-24 bg-black text-white min-h-screen relative">
          {/* Grain overlay for texture */}
          <div className="grain-overlay" />
          
          {children}
        </div>
      )}
      
      {/* If connected but no multisig, show empty state (onboarding will trigger) */}
      {connected && !multisig && pathname !== "/settings" && pathname !== "/create" && (
        <div className="w-full p-8 bg-black text-white min-h-screen flex items-center justify-center relative">
          {/* Grain overlay for texture */}
          <div className="grain-overlay" />
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">No Multisig Found</h2>
            <p className="text-gray-400 mb-6">
              You haven&apos;t created a multisig yet. The onboarding should appear automatically.
            </p>
            <p className="text-sm text-gray-500">
              Refresh the page if the onboarding doesn&apos;t appear.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
