import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Wallet } from "@/components/Wallet";

export const metadata: Metadata = {
  title: "Nova - Multisig Wallet",
  description: "Nova - Secure multisig wallet for Solana.",
  icons: {
    icon: [
      { url: '/logo.png', sizes: 'any' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/logo.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <Wallet>
        <body className="font-sans">{children}</body>
      </Wallet>
    </html>
  );
}
