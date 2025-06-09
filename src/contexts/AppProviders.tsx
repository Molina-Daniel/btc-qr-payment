"use client";

import { ReactNode } from "react";
import { WalletProvider } from "./WalletContext";
import { PaymentProvider } from "./PaymentContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      <PaymentProvider>{children}</PaymentProvider>
    </WalletProvider>
  );
}
