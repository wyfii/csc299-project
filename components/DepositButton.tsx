"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { motion } from "framer-motion";
import { Copy, Check, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

interface DepositButtonProps {
  vaultAddress: string;
  vaultIndex: number;
}

export default function DepositButton({ vaultAddress, vaultIndex }: DepositButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Close modal when vault changes to prevent flickering
  useEffect(() => {
    setIsOpen(false);
    setCopied(false);
  }, [vaultIndex]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(vaultAddress);
      setCopied(true);
      toast.success("Address copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy address");
    }
  };

  return (
    <>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="relative p-[2px]"
        style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800" />
        <button
          onClick={() => setIsOpen(true)}
          className="
            relative px-5 py-2 bg-black
            font-button uppercase tracking-widest
            text-gray-300 hover:text-gray-200 hover:bg-gray-900/50
            transition-all duration-200
            flex items-center gap-2
          "
          style={{ clipPath: 'polygon(6px 0, calc(100% - 2px) 0, calc(100% - 2px) calc(100% - 6px), calc(100% - 6px) calc(100% - 2px), 2px calc(100% - 2px), 2px 6px)' }}
        >
          <span>Deposit</span>
        </button>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="max-w-sm p-0 overflow-hidden border-0 bg-transparent"
        >
          <div className="relative p-[2px]"
               style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
            <div className="absolute inset-0 bg-gray-800" />
            <div className="relative bg-black"
                 style={{ clipPath: 'polygon(10px 0, calc(100% - 2px) 0, calc(100% - 2px) calc(100% - 10px), calc(100% - 10px) calc(100% - 2px), 2px calc(100% - 2px), 2px 10px)' }}
            >
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-3 top-3 z-10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="border-b border-gray-800 px-5 py-4">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-white uppercase tracking-wider">
                    Deposit
                  </DialogTitle>
                  <p className="text-xs text-gray-400 mt-1">
                    Vault {vaultIndex}
                  </p>
                </DialogHeader>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="bg-white p-3" style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}>
                    <QRCodeSVG
                      id="qr-code-svg"
                      value={vaultAddress}
                      size={160}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                </div>

                {/* Vault Address */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 uppercase tracking-wider">
                    Address
                  </label>
                  <div 
                    className="bg-gray-900/50 border border-gray-800 p-2.5 flex items-center justify-between gap-2"
                    style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                  >
                    <span className="font-mono text-[10px] text-gray-300 break-all leading-tight">
                      {vaultAddress}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCopy}
                      className="flex-shrink-0 p-1.5 hover:bg-gray-800 transition-colors"
                      style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }}
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-gray-900/30 border border-gray-800 p-2.5"
                     style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    <span className="text-trench-orange">⚠</span> Only send SOL or SPL tokens. Unsupported assets may be lost.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
