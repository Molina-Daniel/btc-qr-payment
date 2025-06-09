"use client";

import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";

const HeroSection = () => {
  const { generateWallet, isGenerating } = useWallet();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            <span className="inline-flex flex-col md:flex-row items-center gap-3">
              <Zap className="w-12 h-12 md:w-16 md:h-16 text-primary animate-pulse" />
              Instantly Generate
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Bitcoin Testnet
            </span>
            <br />
            Payment Requests
          </h1>

          <p className="text-xl px-6 py-2 md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Create disposable testnet wallets, generate payment QR codes, and
            detect payments in real-time — no setup or API keys required.
          </p>
        </div>

        <div className="pt-4">
          <Button
            onClick={generateWallet}
            size="lg"
            className="text-lg px-8 py-6 bg-blue-400 hover:bg-primary/90 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            {isGenerating ? "Generating..." : "Generate New Wallet"}
            {!isGenerating && <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground pt-8">
          <p>⚠️ Testnet only — not for real BTC</p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
