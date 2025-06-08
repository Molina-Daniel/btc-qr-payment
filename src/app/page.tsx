"use client";

import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import { BtcWallet } from "@/types";

export default function Home() {
  const [wallet, setWallet] = useState<BtcWallet | null>(null);
  console.log("wallet", wallet);

  const handleGenerateWallet = async () => {
    console.log("generate wallet");
    try {
      const response = await fetch("/api/generate-wallet");
      const data = await response.json();
      setWallet(data);
    } catch (error) {
      console.error("Error generating wallet", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <HeroSection onGenerateWallet={handleGenerateWallet} />
    </div>
  );
}
