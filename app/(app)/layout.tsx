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
      name: "Configuration",
      icon: <Users />,
      route: "/config",
    },
    // Hidden for now
    // {
    //   name: "Settings",
    //   icon: <Settings />,
    //   route: "/settings",
    // },
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
          <div className="flex h-auto md:h-full flex-col overflow-y-auto justify-between md:border-r border-zinc-900 px-4 py-6 bg-zinc-950 md:m-4 md:mr-0 md:rounded-lg">
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
                {tabs.map((tab) => (
                  <li key={tab.route}>
                    <a
                      href={tab.route}
                      className={`flex items-center px-4 py-3 text-white transition-all font-mono text-sm ${
                        (path!.startsWith(`${tab.route}/`) && tab.route != "/") ||
                        tab.route === path
                          ? "bg-black border-l-2 border-orange-500"
                          : "hover:bg-zinc-900 opacity-60 hover:opacity-100"
                      }`}
                    >
                      {tab.icon}
                      <span className="ml-3 flex-1 whitespace-nowrap text-base font-medium">
                        {tab.name}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <ConnectWallet />
          </div>
        </aside>

        <aside
          id="mobile-navbar"
          className="block md:hidden inset-x-0 bottom-0 z-50 p-2 fixed bg-black/90 backdrop-blur-sm border-t border-zinc-800"
          aria-label="Mobile navbar"
        >
          <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium mt-1 ">
            {tabs.map((tab) => (
              <Link href={tab.route} key={tab.route}>
                <button
                  type="button"
                  className="inline-flex flex-col items-center justify-center px-5 hover:bg-zinc-800 py-2 group text-white transition-colors"
                >
                  {tab.icon}
                  <span className="flex-1 whitespace-nowrap text-xs mt-1">
                    {tab.name}
                  </span>
                </button>
              </Link>
            ))}
          </div>
        </aside>

        <div className="md:ml-64 flex-1">
          <RenderMultisigRoute multisig={multisig} children={children} />
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
