"use client";

import HeroSection from "@/components/HeroSection";
import Header from "@/components/Header";
import WalletDisplay from "@/components/WalletDisplay";
import PaymentForm from "@/components/PaymentForm";
import PaymentQR from "@/components/PaymentQR";
import PaymentStatus from "@/components/PaymentStatus";
import PaymentsReceived from "@/components/PaymentsReceived";
import Footer from "@/components/Footer";
import { useWallet } from "@/contexts/WalletContext";
import { usePayment } from "@/contexts/PaymentContext";

export default function Home() {
  const { wallet } = useWallet();
  const { btcAmount, paymentStatus, receivedPayments } = usePayment();

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen">
        {!wallet && <HeroSection />}
        {wallet && (
          <>
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-start">
              <div className="w-full max-w-xl space-y-8 flex flex-col items-center justify-center">
                <WalletDisplay />
                {!btcAmount && <PaymentForm />}
                {wallet && btcAmount && (
                  <>
                    <PaymentQR />
                    {paymentStatus && <PaymentStatus />}
                  </>
                )}
                {receivedPayments.length > 0 && <PaymentsReceived />}
              </div>
            </main>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
