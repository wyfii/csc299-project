"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

type UserMultisig = {
  id: string; // document id (multisig address)
  address: string;
  name?: string;
};

export default function MultisigSelector() {
  const { publicKey } = useWallet();
  const [open, setOpen] = useState(false);
  const [multisigs, setMultisigs] = useState<UserMultisig[]>([]);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    const current = getSelectedMultisig();
    if (current) setSelected(current);
  }, []);

  useEffect(() => {
    async function fetchMultisigs() {
      if (!publicKey) return;
      try {
        const userPath = collection(db, "users", publicKey.toBase58(), "multisigs");
        const snapshot = await getDocs(userPath);
        const list: UserMultisig[] = snapshot.docs.map((docSnap) => {
          const data: any = docSnap.data();
          return {
            id: docSnap.id,
            address: data.address || docSnap.id,
            name: data.name,
          };
        });
        setMultisigs(list);
        // Initialize selection if none
        if (!getSelectedMultisig() && list.length > 0) {
          setCookie("x-multisig", list[0].address);
          setSelected(list[0].address);
        }
      } catch (e) {
        console.error("Failed to load multisigs:", e);
      }
    }
    fetchMultisigs();
  }, [publicKey]);

  const setCookie = (name: string, value: string) => {
    document.cookie = `${name}=${value}; path=/; max-age=31536000`;
  };

  const getSelectedMultisig = (): string | null => {
    const match = document.cookie.match(/(?:^|; )x-multisig=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  };

  const handleSelect = (address: string) => {
    setCookie("x-multisig", address);
    setSelected(address);
    setOpen(false);
    // Trigger refresh for server components to pick up header
    setTimeout(() => window.location.reload(), 100);
  };

  const displayLabel = (m: UserMultisig) => {
    if (m.name && m.name.trim().length > 0) return `${m.name} (${m.address.slice(0,4)}...${m.address.slice(-4)})`;
    return `${m.address.slice(0,4)}...${m.address.slice(-4)}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between font-sans">
          {selected ? `${selected.slice(0,4)}...${selected.slice(-4)}` : "Select multisig"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2">
        <div className="space-y-1">
          {multisigs.map((m) => (
            <button
              key={m.id}
              onClick={() => handleSelect(m.address)}
              className={`w-full text-left px-3 py-2 rounded border ${selected === m.address ? 'border-trench-orange text-white' : 'border-zinc-800 text-gray-300 hover:bg-zinc-900'}`}
            >
              <div className="text-sm">{displayLabel(m)}</div>
            </button>
          ))}

          <Link href="/create">
            <Button variant="ghost" className="w-full justify-start gap-2 text-gray-300 hover:text-white">
              <PlusCircle className="w-4 h-4" /> Create new multisig
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}


