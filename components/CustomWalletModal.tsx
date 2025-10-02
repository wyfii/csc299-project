"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";

interface CustomWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomWalletModal({ isOpen, onClose }: CustomWalletModalProps) {
  const { wallets, select, publicKey, disconnect, wallet } = useWallet();
  const walletModal = useWalletModal();

  useEffect(() => {
    if (publicKey) {
      onClose();
    }
  }, [publicKey, onClose]);

  const handleWalletSelect = (walletName: string) => {
    const selectedWallet = wallets.find(w => w.adapter.name === walletName);
    if (selectedWallet) {
      select(selectedWallet.adapter.name);
      // Trigger connect after selection
      setTimeout(() => {
        walletModal.setVisible(false);
      }, 100);
    }
  };

  const installedWallets = wallets.filter(w => w.readyState === "Installed");
  const notInstalledWallets = wallets.filter(w => w.readyState !== "Installed");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-md bg-black border-gray-800 p-0 overflow-hidden"
        style={{ clipPath: 'polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-gray-800 p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white uppercase tracking-wider">
              Connect Wallet
            </DialogTitle>
            <p className="text-sm text-gray-400 mt-2">
              Choose a wallet to connect to Nova
            </p>
          </DialogHeader>
        </div>

        {/* Wallet List */}
        <div className="p-6 space-y-3 max-h-[500px] overflow-y-auto">
          {/* Installed Wallets */}
          {installedWallets.length > 0 && (
            <div className="space-y-2">
              {installedWallets.map((wallet) => (
                <motion.button
                  key={wallet.adapter.name}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleWalletSelect(wallet.adapter.name)}
                  className="
                    w-full flex items-center gap-4 p-4 
                    bg-gray-900/50 border border-gray-800
                    hover:bg-gray-900 hover:border-gray-700
                    transition-all duration-200
                    group
                  "
                  style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
                >
                  {wallet.adapter.icon && (
                    <Image
                      src={wallet.adapter.icon}
                      alt={wallet.adapter.name}
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                  )}
                  <div className="flex-1 text-left">
                    <p className="text-white font-medium group-hover:text-trench-orange transition-colors">
                      {wallet.adapter.name}
                    </p>
                    <p className="text-xs text-gray-500">Installed</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500" />
                </motion.button>
              ))}
            </div>
          )}

          {/* Not Installed Wallets */}
          {notInstalledWallets.length > 0 && (
            <div className="space-y-2">
              {installedWallets.length > 0 && (
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-6 mb-2">
                  Not Installed
                </p>
              )}
              {notInstalledWallets.map((wallet) => (
                <motion.a
                  key={wallet.adapter.name}
                  whileTap={{ scale: 0.98 }}
                  href={wallet.adapter.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    w-full flex items-center gap-4 p-4 
                    bg-gray-900/30 border border-gray-800
                    hover:bg-gray-900/50 hover:border-gray-700
                    transition-all duration-200
                    group
                  "
                  style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
                >
                  {wallet.adapter.icon && (
                    <Image
                      src={wallet.adapter.icon}
                      alt={wallet.adapter.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 opacity-50"
                    />
                  )}
                  <div className="flex-1 text-left">
                    <p className="text-gray-400 font-medium group-hover:text-gray-300 transition-colors">
                      {wallet.adapter.name}
                    </p>
                    <p className="text-xs text-gray-600">Install to use</p>
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

