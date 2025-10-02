"use client";
import * as React from "react";
import { Check, ChevronsUpDown, Vault } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";

// Generate vault indices from 0 to 15
const vaultIndices = Array.from({ length: 16 }, (_, index) => ({
  value: index.toString(),
  label: `Vault ${index}`,
}));

interface VaultSelectorProps {
  currentVaultIndex?: number;
}

export function VaultSelector({ currentVaultIndex = 0 }: VaultSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(currentVaultIndex.toString());

  const router = useRouter();

  React.useEffect(() => {
    if (value !== currentVaultIndex.toString() && value !== "") {
      console.log('🔄 Vault selector: Switching from vault', currentVaultIndex, 'to vault', value);
      document.cookie = `x-vault-index=${value}; path=/; max-age=31536000`;
      
      // Refresh to reload vault data from server
      router.refresh();
    }
  }, [value, currentVaultIndex, router]);

  // Update local state when prop changes
  React.useEffect(() => {
    setValue(currentVaultIndex.toString());
  }, [currentVaultIndex]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.div
          whileTap={{ scale: 0.95 }}
          className="relative p-[2px]"
          style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
        >
          {/* Border gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800" />
          
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="
              relative px-4 py-2 bg-black border-none
              font-button uppercase
              text-gray-300 hover:text-gray-200 hover:bg-gray-900/50
              transition-all duration-200
              flex items-center gap-2 min-w-[140px] justify-between
            "
            style={{ clipPath: 'polygon(6px 0, calc(100% - 2px) 0, calc(100% - 2px) calc(100% - 6px), calc(100% - 6px) calc(100% - 2px), 2px calc(100% - 2px), 2px 6px)' }}
          >
            <div className="flex items-center gap-2">
              <Vault className="w-3 h-3" />
              <span>Vault {value}</span>
            </div>
            <ChevronsUpDown className="w-3 h-3 opacity-50" />
          </Button>
        </motion.div>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-[180px] p-1 bg-black border-none"
        style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
      >
        {/* Border wrapper */}
        <div 
          className="relative p-[2px] bg-gradient-to-r from-gray-700 to-gray-800"
          style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
        >
          <div 
            className="bg-black"
            style={{ clipPath: 'polygon(4px 0, calc(100% - 2px) 0, calc(100% - 2px) calc(100% - 4px), calc(100% - 4px) calc(100% - 2px), 2px calc(100% - 2px), 2px 4px)' }}
          >
        <Command className="bg-black">
          <CommandInput 
            placeholder="Search vault..." 
            className="text-xs text-gray-300 bg-black border-none"
          />
          <CommandEmpty className="text-xs text-gray-500 p-4">No vault found.</CommandEmpty>
          <CommandGroup>
            {vaultIndices.map((vaultIndex) => (
              <CommandItem
                key={vaultIndex.value}
                value={vaultIndex.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
                className="
                  text-xs text-gray-300 hover:text-white hover:bg-gray-900/50
                  transition-all duration-200 cursor-pointer
                  flex items-center gap-2 px-3 py-2
                "
              >
                <Check
                  className={cn(
                    "w-3 h-3",
                    value === vaultIndex.value ? "opacity-100 text-orange-500" : "opacity-0"
                  )}
                />
                <Vault className="w-3 h-3 text-gray-400" />
                <span className="font-bold uppercase tracking-widest">
                  {vaultIndex.label}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
