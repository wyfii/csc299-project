"use client";
import { Button } from "./ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { useState } from "react";
import CustomWalletModal from "./CustomWalletModal";
import { Wallet, LogOut } from "lucide-react";

const ConnectWallet = () => {
  const { publicKey, disconnect } = useWallet();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div>
        {!publicKey ? (
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="relative p-[2px]"
            style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-trench-orange to-orange-500" />
            <button
              onClick={() => setShowModal(true)}
              className="
                relative w-full px-5 py-3 bg-black
                font-button uppercase tracking-widest
                text-trench-orange hover:text-orange-500
                transition-all duration-200
                flex items-center justify-center gap-2
              "
              style={{ clipPath: 'polygon(6px 0, calc(100% - 2px) 0, calc(100% - 2px) calc(100% - 6px), calc(100% - 6px) calc(100% - 2px), 2px calc(100% - 2px), 2px 6px)' }}
            >
              <Wallet className="w-4 h-4" />
              <span>Connect</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="relative p-[2px]"
            style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-trench-orange to-orange-500" />
            <button
              onClick={disconnect}
              className="
                relative w-full px-5 py-3 bg-black
                font-button uppercase tracking-widest
                text-trench-orange hover:text-orange-500
                transition-all duration-200
                flex items-center justify-center gap-2
              "
              style={{ clipPath: 'polygon(6px 0, calc(100% - 2px) 0, calc(100% - 2px) calc(100% - 6px), calc(100% - 6px) calc(100% - 2px), 2px calc(100% - 2px), 2px 6px)' }}
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          </motion.div>
        )}
      </div>

      <CustomWalletModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

export default ConnectWallet;
