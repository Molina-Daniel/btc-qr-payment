"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Hourglass,
  Info,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentStatusEnum } from "@/types";
import { usePayment } from "@/contexts/PaymentContext";

const MEMPOOL_EXPLORER_URL = "https://mempool.space/testnet4/tx/";

const StatusIcon = ({ status }: { status: PaymentStatusEnum }) => {
  const iconProps = {
    className: "h-16 w-16 mb-4",
  };

  switch (status) {
    case "LISTENING":
      return (
        <Loader2
          {...iconProps}
          className={`${iconProps.className} animate-spin text-muted-foreground`}
        />
      );
    case "PAYMENT_DETECTED":
      return (
        <Info
          {...iconProps}
          className={`${iconProps.className} text-blue-500`}
        />
      );
    case "CONFIRMING":
      return (
        <Hourglass
          {...iconProps}
          className={`${iconProps.className} text-yellow-500`}
        />
      );
    case "PAYMENT_CONFIRMED":
      return (
        <CheckCircle2
          {...iconProps}
          className={`${iconProps.className} text-green-500`}
        />
      );
    case "API_ERROR":
      return (
        <XCircle
          {...iconProps}
          className={`${iconProps.className} text-red-500`}
        />
      );
    default:
      return (
        <AlertTriangle
          {...iconProps}
          className={`${iconProps.className} text-gray-500`}
        />
      );
  }
};

const PaymentStatus = () => {
  const { paymentStatus, resetState } = usePayment();

  if (!paymentStatus) return null;

  return (
    <Card className="w-full shadow-2xl bg-card/80 backdrop-blur-sm text-center animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center justify-center">
          Payment Status
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center px-8 pb-4">
        <StatusIcon status={paymentStatus.status} />
        <p className="text-lg font-semibold mb-2">{paymentStatus.message}</p>

        {paymentStatus.details?.transactionId && (
          <div className="text-sm text-muted-foreground font-code mb-4">
            <p>Transaction ID:</p>
            <Link
              href={`${MEMPOOL_EXPLORER_URL}${paymentStatus.details.transactionId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              {paymentStatus.details.transactionId}
            </Link>
          </div>
        )}
      </CardContent>
      {paymentStatus.status === "PAYMENT_CONFIRMED" ||
        (paymentStatus.status === "API_ERROR" && (
          <CardFooter className="flex-col space-y-2">
            <Button
              onClick={resetState}
              size="lg"
              className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <RefreshCw className="mr-2 h-5 w-5" /> Start Over
            </Button>
          </CardFooter>
        ))}
    </Card>
  );
};

export default PaymentStatus;
