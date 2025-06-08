"use client";

import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import WalletDisplay from "@/components/WalletDisplay";
import PaymentForm from "@/components/PaymentForm";
import PaymentQR from "@/components/PaymentQR";
import { BtcWallet } from "@/types";

export default function Home() {
  const [wallet, setWallet] = useState<BtcWallet | null>(null);
  const [btcAmount, setBtcAmount] = useState<string>("");

  const handleGenerateWallet = async () => {
    try {
      const response = await fetch("/api/generate-wallet");
      const data = await response.json();
      setWallet(data);
    } catch (error) {
      console.error("Error generating wallet", error);
    }
  };

  const handleAmountSubmit = (btcAmount: string) => {
    setBtcAmount(btcAmount);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {!wallet && <HeroSection onGenerateWallet={handleGenerateWallet} />}
      {wallet && (
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <div className="w-full max-w-4xl space-y-8 flex flex-col items-center justify-center">
            <WalletDisplay wallet={wallet} />
            <PaymentForm onSubmit={handleAmountSubmit} />
            {wallet && btcAmount && (
              <PaymentQR wallet={wallet} amount={btcAmount} />
            )}
          </div>
        </main>
      )}
    </div>
  );
}
