"use client";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UserData {
  walletAddress: string;
  hasCreatedMultisig: boolean;
  createdAt: any;
  lastLogin: any;
}

export function useUserOnboarding() {
  const { publicKey, connected } = useWallet();
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Check localStorage first for instant feedback
  const checkLocalStorage = (walletAddress: string): boolean => {
    if (typeof window === "undefined") return false;
    const hasCreated = localStorage.getItem(`nova-user-${walletAddress}`);
    return hasCreated === "true";
  };

  useEffect(() => {
    async function checkUserStatus() {
      if (!connected || !publicKey) {
        console.log("useUserOnboarding: Not connected or no publicKey");
        setIsLoading(false);
        setIsNewUser(null);
        return;
      }

      setIsLoading(true);
      
      try {
        const walletAddress = publicKey.toBase58();
        console.log("useUserOnboarding: Checking user status for", walletAddress);
        
        // Check if user actually has multisigs in Firestore (source of truth)
        const multisigsResponse = await fetch(
          `https://firestore.googleapis.com/v1/projects/nova-a42e0/databases/(default)/documents/users/${walletAddress}/multisigs?key=AIzaSyCZsi5RaDwItGNf_KPee_2d9EsNJDtLsDI`
        );
        
        const hasMultisigInFirestore = multisigsResponse.ok && 
          (await multisigsResponse.json()).documents?.length > 0;
        
        console.log("useUserOnboarding: Has multi-sig in Firestore?", hasMultisigInFirestore);

        if (hasMultisigInFirestore) {
          // User has multi-sig - don't show onboarding
          console.log("useUserOnboarding: User HAS multi-sig - no onboarding needed");
          setIsNewUser(false);
          localStorage.setItem(`nova-user-${walletAddress}`, "true");
        } else {
          // User has NO multi-sig - show onboarding
          console.log("useUserOnboarding: User has NO multi-sig - showing onboarding");
          setIsNewUser(true);
          localStorage.removeItem(`nova-user-${walletAddress}`);
        }

        // Create/update user document in Firestore
        const userRef = doc(db, "users", walletAddress);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // New user - create record
          const newUserData: UserData = {
            walletAddress,
            hasCreatedMultisig: hasMultisigInFirestore,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
          };
          await setDoc(userRef, newUserData);
          setUserData(newUserData);
        } else {
          // Existing user - update
          const data = userSnap.data() as UserData;
          await setDoc(userRef, { 
            lastLogin: serverTimestamp(),
            hasCreatedMultisig: hasMultisigInFirestore,
          }, { merge: true });
          setUserData({...data, hasCreatedMultisig: hasMultisigInFirestore});
        }
      } catch (error) {
        console.error("useUserOnboarding: Error checking user status:", error);
        // On error, assume new user to be safe
        setIsNewUser(true);
      } finally {
        setIsLoading(false);
        console.log("useUserOnboarding: Finished loading");
      }
    }

    checkUserStatus();
  }, [connected, publicKey]);

  const markMultisigCreated = async () => {
    if (!publicKey) return;

    try {
      const walletAddress = publicKey.toBase58();
      
      // Save to localStorage IMMEDIATELY for instant effect
      localStorage.setItem(`nova-user-${walletAddress}`, "true");
      console.log("✅ Saved to localStorage - user marked as having multi-sig");
      
      // Also save to Firebase
      const userRef = doc(db, "users", walletAddress);
      await setDoc(userRef, { hasCreatedMultisig: true }, { merge: true });
      console.log("✅ Saved to Firebase - user marked as having multi-sig");
      
      setIsNewUser(false);
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  return {
    isNewUser,
    isLoading,
    userData,
    markMultisigCreated,
  };
}
