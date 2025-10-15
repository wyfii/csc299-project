"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface ApprovalContextType {
  isInApprovalFlow: boolean;
  currentMultisigPda: string | null;
  setApprovalFlow: (isActive: boolean, multisigPda?: string) => void;
  clearApprovalFlow: () => void;
}

const ApprovalContext = createContext<ApprovalContextType | undefined>(undefined);

interface ApprovalProviderProps {
  children: ReactNode;
}

/**
 * Context provider to track when user is in an approval flow
 * This prevents onboarding interruption during wallet switching for approvals
 */
export function ApprovalProvider({ children }: ApprovalProviderProps) {
  const [isInApprovalFlow, setIsInApprovalFlow] = useState(false);
  const [currentMultisigPda, setCurrentMultisigPda] = useState<string | null>(null);

  const setApprovalFlow = (isActive: boolean, multisigPda?: string) => {
    setIsInApprovalFlow(isActive);
    setCurrentMultisigPda(multisigPda || null);
    
    console.log("🔄 ApprovalContext: Setting approval flow:", { 
      isActive, 
      multisigPda: multisigPda || "none" 
    });
  };

  const clearApprovalFlow = () => {
    setIsInApprovalFlow(false);
    setCurrentMultisigPda(null);
    console.log("🔄 ApprovalContext: Cleared approval flow");
  };

  const value: ApprovalContextType = {
    isInApprovalFlow,
    currentMultisigPda,
    setApprovalFlow,
    clearApprovalFlow,
  };

  return (
    <ApprovalContext.Provider value={value}>
      {children}
    </ApprovalContext.Provider>
  );
}

/**
 * Hook to use approval context
 */
export function useApprovalContext(): ApprovalContextType {
  const context = useContext(ApprovalContext);
  if (context === undefined) {
    throw new Error("useApprovalContext must be used within an ApprovalProvider");
  }
  return context;
}
