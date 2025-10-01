"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { PlusCircle, Search, Wallet } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function EmptyMultisigState() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white font-sans">
              No Multisig Selected
            </CardTitle>
            <CardDescription className="text-gray-400 font-sans">
              Get started by creating a new multi-sig or adding an existing one
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Create New Multisig */}
              <Link href="/create" className="block">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-full"
                >
                  <div className="p-6 border-2 border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 transition-colors cursor-pointer h-full rounded-lg">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <PlusCircle className="w-6 h-6 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1 font-sans">
                          Create New Multisig
                        </h3>
                        <p className="text-sm text-gray-400 font-sans">
                          Set up a new Multisig with custom members and threshold
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>

              {/* Add Existing Multisig */}
              <Link href="/settings" className="block">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-full"
                >
                  <div className="p-6 border-2 border-zinc-700 hover:border-zinc-600 bg-zinc-800/50 hover:bg-zinc-800 transition-all cursor-pointer h-full rounded-lg">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center">
                        <Search className="w-6 h-6 text-gray-300" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1 font-sans">
                          Add Existing Multisig
                        </h3>
                        <p className="text-sm text-gray-400 font-sans">
                          Connect to a Multisig you&apos;re already a member of
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </div>

            <div className="pt-4 text-center">
              <p className="text-xs text-gray-500 font-sans">
                💡 Tip: You can switch between multi-sigs anytime from the settings page
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
