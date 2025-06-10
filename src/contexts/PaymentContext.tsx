"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { PaymentStatus, Transaction } from "@/types";
import { useWallet } from "./WalletContext";

interface PaymentContextType {
  btcAmount: string;
  requestTimestamp: number | null;
  paymentStatus: PaymentStatus | null;
  receivedPayments: Transaction[];
  isProcessing: boolean;
  error: string | null;
  submitPaymentRequest: (amount: string) => void;
  resetState: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const { wallet } = useWallet();
  const [btcAmount, setBtcAmount] = useState<string>("");
  const [requestTimestamp, setRequestTimestamp] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(
    null
  );
  const [receivedPayments, setReceivedPayments] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPaymentStatus = useCallback(
    async (amountOverride?: string, timestampOverride?: number) => {
      const currentAmount = amountOverride || btcAmount;
      const currentTimestamp = timestampOverride || requestTimestamp;

      if (!wallet || !currentAmount || !currentTimestamp) return;

      try {
        setIsProcessing(true);
        setError(null);

        const response = await fetch(
          `/api/check-payment?address=${wallet.address}&amount=${currentAmount}&requestTimestamp=${currentTimestamp}`
        );

        if (!response.ok) {
          throw new Error("API request failed.");
        }

        const data = await response.json();
        setPaymentStatus(data.paymentStatus);
        setReceivedPayments(data.receivedPayments);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error checking payment";
        setError(errorMessage);
        console.error("Error checking payment status:", err);
        setPaymentStatus({
          status: "API_ERROR",
          message: "Could not connect to the server.",
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [wallet, btcAmount, requestTimestamp]
  );

  const submitPaymentRequest = (newAmount: string) => {
    const now = Date.now();
    setBtcAmount(newAmount);
    setRequestTimestamp(now);
    setPaymentStatus({ status: "LISTENING", message: "Initializing..." });
    setReceivedPayments([]);
    checkPaymentStatus(newAmount, now);
  };

  const resetState = () => {
    setBtcAmount("");
    setRequestTimestamp(null);
    setPaymentStatus(null);
    setReceivedPayments([]);
    setIsProcessing(false);
    setError(null);
  };

  useEffect(() => {
    if (!btcAmount || !wallet || !requestTimestamp) return;

    const finalStates: PaymentStatus["status"][] = [
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
    <PaymentContext.Provider
      value={{
        btcAmount,
        requestTimestamp,
        paymentStatus,
        receivedPayments,
        isProcessing,
        error,
        submitPaymentRequest,
        resetState,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
}
