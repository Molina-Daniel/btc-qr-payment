import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "⚡ BTC QR App",
  description:
    "Instantly Generate Bitcoin Testnet Payment Requests. Create disposable testnet wallets, generate payment QR codes, and detect payments in real-time — no setup or API keys required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
      <Toaster />
    </html>
  );
}
