import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { PublicKey } from "@solana/web3.js";
import { Toaster } from "@/components/ui/sonner";
import ConnectWallet from "@/components/ConnectWalletButton";
import {
  LucideHome,
  ArrowDownUp,
  Users,
  Settings,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";
import RenderMultisigRoute from "@/components/RenderMultisigRoute";
import WalletCookieSetter from "@/components/WalletCookieSetter";
import { getMultisigFromFirestore } from "@/lib/getMultisigFromFirestore";

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
  const tabs = [
    {
      name: "Home",
      icon: <LucideHome />,
      route: "/",
    },
    {
      name: "Transactions",
      icon: <ArrowDownUp />,
      route: "/transactions",
    },
    {
      name: "Settings",
      icon: <Settings />,
      route: "/settings",
    },
  ];

  const headersList = headers();

  const path = headersList.get("x-pathname");
  
  // Get wallet address and query Firestore for multisig
  const walletAddress = headersList.get("x-wallet");
  let multisigCookie: string | null = null;
  if (walletAddress) {
    multisigCookie = await getMultisigFromFirestore(walletAddress);
  }
  
  const multisig = await isValidPublicKey(multisigCookie || "");

  return (
    <>
      <WalletCookieSetter />
      <div className="flex flex-col md:flex-row h-screen min-w-full bg-black">
        <aside
          id="sidebar"
          className="hidden md:block md:left-0 md:top-0 md:w-64 z-40 h-auto md:h-screen md:fixed"
          aria-label="Sidebar"
        >
          <div className="h-full md:m-4 md:mr-2 relative p-[2px]"
               style={{ clipPath: 'polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)' }}>
            <div className="absolute inset-0 bg-gray-800" />
            <div 
              className="relative flex h-full flex-col overflow-y-auto justify-between px-4 py-6 bg-black"
              style={{ clipPath: 'polygon(14px 0, calc(100% - 2px) 0, calc(100% - 2px) calc(100% - 14px), calc(100% - 14px) calc(100% - 2px), 2px calc(100% - 2px), 2px 14px)' }}
            >
            <div>
              <Link href="/">
                <div className="mb-10 flex items-center gap-3 px-3 py-2 text-white hover:opacity-80 transition-opacity">
                  <Image
                    src="/logo.png"
                    alt="Nova Logo"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                  <h1 className="logo-text text-2xl font-bold tracking-wider text-white">
                    NOVA
                  </h1>
                </div>
              </Link>
              <ul className="space-y-2 text-sm font-medium">
                {tabs.map((tab) => {
                  const isActive = (path!.startsWith(`${tab.route}/`) && tab.route != "/") || tab.route === path;
                  return (
                    <li key={tab.route}>
                      <a
                        href={tab.route}
                        className={`flex items-center px-4 py-3 text-white transition-all font-button uppercase tracking-wider relative ${
                          isActive
                            ? "text-white bg-gray-900/50"
                            : "text-gray-500 hover:text-gray-300 hover:bg-gray-900/30"
                        }`}
                        style={{ clipPath: isActive ? 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' : undefined }}
                      >
                        <span className="w-5">{tab.icon}</span>
                        <span className="ml-3 flex-1 whitespace-nowrap">
                          {tab.name}
                        </span>
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-trench-orange" />
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            <ConnectWallet />
            </div>
          </div>
        </aside>

        <aside
          id="mobile-navbar"
          className="block md:hidden inset-x-0 bottom-0 z-50 fixed"
          aria-label="Mobile navbar"
        >
          <div className="flex items-center justify-center p-4 pb-6">
            <div className="bg-black/90 backdrop-blur-xl border border-gray-800 p-2 shadow-2xl"
                 style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
            >
              <div className="flex gap-2">
                {tabs.map((tab) => {
                  const isActive = path === tab.route || (path?.startsWith(`${tab.route}/`) && tab.route !== "/");
                  return (
                    <Link href={tab.route} key={tab.route}>
                      <button
                        type="button"
                        className={`inline-flex flex-col items-center justify-center px-6 py-3 transition-all font-button uppercase tracking-wider ${
                          isActive 
                            ? "bg-trench-orange text-black" 
                            : "text-gray-400 hover:text-white hover:bg-gray-900/50"
                        }`}
                        style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                      >
                        {tab.icon}
                        <span className="text-xs mt-1 font-bold">
                          {tab.name}
                        </span>
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        <div className="md:ml-64 flex-1">
          <RenderMultisigRoute multisig={multisig}>
            {children}
          </RenderMultisigRoute>
        </div>
      </div>
      <Toaster
        expand
        visibleToasts={3}
        icons={{
          error: <AlertTriangle className="w-4 h-4 text-red-600" />,
          success: <CheckSquare className="w-4 h-4 text-green-600" />,
        }}
      />
    </>
  );
};

export default AppLayout;

const isValidPublicKey = async (multisigString: string) => {
  try {
    new PublicKey(multisigString);
    return true;
  } catch (e) {
    return false;
  }
};
