"use client";

import { useCallback, useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import WalletDisplay from "@/components/WalletDisplay";
import PaymentForm from "@/components/PaymentForm";
import PaymentQR from "@/components/PaymentQR";
import PaymentStatus from "@/components/PaymentStatus";
import PaymentsReceived from "@/components/PaymentsReceived";
import {
  BtcWallet,
  PaymentStatus as PaymentStatusType,
  Transaction,
} from "@/types";

export default function Home() {
  const [wallet, setWallet] = useState<BtcWallet | null>(null);
  const [btcAmount, setBtcAmount] = useState<string>("");
  const [requestTimestamp, setRequestTimestamp] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusType | null>(
    null
  );
  const [receivedPayments, setReceivedPayments] = useState<Transaction[]>([]);

  const handleGenerateWallet = async () => {
    try {
      const response = await fetch("/api/generate-wallet");
      const data = await response.json();
      setWallet(data);
    } catch (error) {
      console.error("Error generating wallet", error);
    }
  };

  const handleAmountSubmit = (newAmount: string) => {
    const now = Date.now();
    setBtcAmount(newAmount);
    setRequestTimestamp(now);
    setPaymentStatus({ status: "LISTENING", message: "Initializing..." });
    setReceivedPayments([]);
    checkPaymentStatus(newAmount, now);
  };

  const checkPaymentStatus = useCallback(
    async (amountOverride?: string, timestampOverride?: number) => {
      const currentAmount = amountOverride || btcAmount;
      const currentTimestamp = timestampOverride || requestTimestamp;

      if (!wallet || !currentAmount || !currentTimestamp) return;

      try {
        const response = await fetch(
          `/api/check-payment?address=${wallet.address}&amount=${currentAmount}&requestTimestamp=${currentTimestamp}`
        );
        if (!response.ok) throw new Error("API request failed.");
        const data = await response.json();
        setPaymentStatus(data.paymentStatus);
        setReceivedPayments(data.receivedPayments);
      } catch (error) {
        console.error("Error checking payment status:", error);
        setPaymentStatus({
          status: "API_ERROR",
          message: "Could not connect to the server.",
        });
      }
    },
    [wallet, btcAmount, requestTimestamp]
  );

  useEffect(() => {
    if (!btcAmount || !wallet || !requestTimestamp) return;

    const finalStates: PaymentStatusType["status"][] = [
      "PAYMENT_CONFIRMED",
      "API_ERROR",
    ];

    if (paymentStatus && finalStates.includes(paymentStatus.status)) {
      return;
    }

    const intervalId = setInterval(() => {
      checkPaymentStatus();
    }, 15000); // Poll every 15 seconds

    return () => clearInterval(intervalId);
  }, [btcAmount, wallet, requestTimestamp, checkPaymentStatus, paymentStatus]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
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
            {receivedPayments.length > 0 && (
              <PaymentsReceived
                transactions={receivedPayments}
                address={wallet.address}
              />
            )}
          </div>
        </main>
      )}
    </div>
  );
}
