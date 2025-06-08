"use client";

import { useCallback, useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import WalletDisplay from "@/components/WalletDisplay";
import PaymentForm from "@/components/PaymentForm";
import PaymentQR from "@/components/PaymentQR";
import PaymentStatus from "@/components/PaymentStatus";
import { BtcWallet, PaymentStatus as PaymentStatusType } from "@/types";

export default function Home() {
  const [wallet, setWallet] = useState<BtcWallet | null>(null);
  const [btcAmount, setBtcAmount] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusType | null>(
    null
  );

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
    checkPaymentStatus(btcAmount);
  };

  const checkPaymentStatus = useCallback(
    async (amountOverride?: string) => {
      const currentAmount = amountOverride || btcAmount;
      if (!wallet || !currentAmount) return;

      try {
        const response = await fetch(
          `/api/check-payment?address=${wallet.address}&amount=${currentAmount}`
        );
        const data = await response.json();
        setPaymentStatus(data);
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    },
    [wallet, btcAmount]
  );

  useEffect(() => {
    if (!btcAmount || !wallet) return;

    const finalStates = [
      "PAYMENT_CONFIRMED",
      "ERROR_UNDERPAID",
      "ERROR_MULTIPLE",
      "API_ERROR",
      "TIMEOUT",
    ];

    if (paymentStatus && finalStates.includes(paymentStatus.status)) {
      return;
    }

    const intervalId = setInterval(() => {
      checkPaymentStatus();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [btcAmount, wallet, checkPaymentStatus, paymentStatus]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {!wallet && <HeroSection onGenerateWallet={handleGenerateWallet} />}
      {wallet && (
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <div className="w-full max-w-4xl space-y-8 flex flex-col items-center justify-center">
            <WalletDisplay wallet={wallet} />
            <PaymentForm onSubmit={handleAmountSubmit} />
            {wallet && btcAmount && (
              <>
                <PaymentQR wallet={wallet} amount={btcAmount} />
                {paymentStatus && <PaymentStatus status={paymentStatus} />}
              </>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
