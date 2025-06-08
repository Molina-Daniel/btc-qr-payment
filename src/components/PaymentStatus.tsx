"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Hourglass,
  Info,
  Loader2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentStatus } from "@/types";

interface PaymentStatusDisplayProps {
  status: PaymentStatus;
}

const MEMPOOL_EXPLORER_URL = "https://mempool.space/testnet4/tx/";

const StatusIcon = ({ status }: { status: PaymentStatus["status"] }) => {
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
    case "ERROR_UNDERPAID":
    case "ERROR_MULTIPLE":
    case "API_ERROR":
    case "TIMEOUT":
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

const PaymentStatusDisplay = ({ status }: PaymentStatusDisplayProps) => {
  return (
    <Card className="w-full max-w-lg shadow-2xl bg-card/80 backdrop-blur-sm text-center">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center justify-center">
          Payment Status
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-8">
        <StatusIcon status={status.status} />
        <p className="text-lg font-semibold mb-2">{status.message}</p>

        {status.details?.transactionId && (
          <div className="text-sm text-muted-foreground mb-4">
            <p>Transaction ID:</p>
            <Link
              href={`${MEMPOOL_EXPLORER_URL}${status.details.transactionId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              {status.details.transactionId}
            </Link>
          </div>
        )}

        {status.status === "ERROR_UNDERPAID" && status.details && (
          <div className="text-sm text-red-400">
            Expected: {status.details.expectedAmountSatoshis} sats
            <br />
            Received: {status.details.receivedAmountSatoshis} sats
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentStatusDisplay;
