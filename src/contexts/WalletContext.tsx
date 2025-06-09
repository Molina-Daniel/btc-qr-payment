"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { BtcWallet } from "@/types";
import { decrypt } from "@/lib/crypto";

interface WalletContextType {
  wallet: BtcWallet | null;
  isGenerating: boolean;
  error: string | null;
  generateWallet: () => Promise<void>;
  getDecryptedMnemonic: () => string | null;
  getDecryptedPrivateKey: () => string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<BtcWallet | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateWallet = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch("/api/generate-wallet");

      if (!response.ok) {
        throw new Error(`Failed to generate wallet: ${response.statusText}`);
      }

      const data = await response.json();
      setWallet(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error generating wallet";
      setError(errorMessage);
      console.error("Error generating wallet", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Methods to decrypt sensitive data when needed
  const getDecryptedMnemonic = () => {
    if (!wallet) return null;
    return decrypt(wallet.mnemonic);
  };

  const getDecryptedPrivateKey = () => {
    if (!wallet) return null;
    return decrypt(wallet.privateKeyWIF);
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        isGenerating,
        error,
        generateWallet,
        getDecryptedMnemonic,
        getDecryptedPrivateKey,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
