"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Users, Shield, Zap, ArrowRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Nova",
      description: "Nova is a powerful multisig wallet built on Solana.",
      icon: Shield,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-gray-400">
            Secure your assets with multi-signature technology. Perfect for teams, DAOs, and anyone who values security.
          </p>
        </div>
      ),
    },
    {
      title: "Create Your First Multisig",
      description: "Let's get you started by creating your first Squad.",
      icon: Users,
      content: (
        <div className="space-y-6">
          <div className="flex items-start space-x-4 text-left">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
              <span className="text-orange-500 font-bold">1</span>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Add Members</h4>
              <p className="text-sm text-gray-400">Add wallet addresses of team members who will control the multisig.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 text-left">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
              <span className="text-orange-500 font-bold">2</span>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Set Threshold</h4>
              <p className="text-sm text-gray-400">Define how many approvals are needed to execute transactions.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 text-left">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
              <span className="text-orange-500 font-bold">3</span>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Start Collaborating</h4>
              <p className="text-sm text-gray-400">Create proposals, vote, and execute transactions securely together.</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
      router.push("/create");
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 antialiased">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleSkip}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              duration: 0.3,
              ease: [0.23, 1, 0.32, 1]
            }}
            className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Progress indicator */}
            <div className="flex space-x-2 px-6 pt-6">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    index <= step ? "bg-orange-500" : "bg-zinc-800"
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <div className="p-8">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Icon */}
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-black" />
                  </div>
                </div>

                {/* Title */}
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-white font-sans">{currentStep.title}</h2>
                  <p className="text-gray-400 font-sans">{currentStep.description}</p>
                </div>

                {/* Step content */}
                <div className="py-4">{currentStep.content}</div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4">
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="text-gray-400 hover:text-white font-sans"
                  >
                    Skip for now
                  </Button>

                  <Button
                    onClick={handleNext}
                    className="bg-orange-500 hover:bg-orange-600 text-black font-semibold px-6 font-sans"
                  >
                    {step < steps.length - 1 ? "Next" : "Create Multisig"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
