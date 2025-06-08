"use client";

import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onGenerateWallet: () => void;
}

const HeroSection = ({ onGenerateWallet }: HeroSectionProps) => {
  return (
    <div className="pt-4">
      <Button
        onClick={onGenerateWallet}
        size="lg"
        className="cursor-pointer text-lg px-8 py-6 bg-blue-400 hover:bg-primary/90 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
      >
        Generate Wallet
      </Button>
    </div>
  );
};

export default HeroSection;
