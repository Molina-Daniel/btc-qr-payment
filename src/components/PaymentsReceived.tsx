"use client";

import Link from "next/link";
import { History, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/contexts/WalletContext";
import { usePayment } from "@/contexts/PaymentContext";

const MEMPOOL_EXPLORER_URL = "https://mempool.space/testnet4/tx/";

const PaymentsReceived = () => {
  const { wallet } = useWallet();
  const { receivedPayments } = usePayment();

  if (!wallet || !receivedPayments.length) return null;

  // Sort transactions from newest to oldest
  const sortedTransactions = [...receivedPayments].sort(
    (a, b) => (b.status.block_time ?? 0) - (a.status.block_time ?? 0)
  );

  return (
    <Card
      className="w-full shadow-2xl bg-card/80 backdrop-blur-sm animate-fade-in"
      data-testid="payments-received"
    >
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center">
          <History className="mr-3 h-7 w-7 text-primary" />
          Recently Received Payments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {sortedTransactions.map((tx) => {
            const receivedAmountSats = tx.vout
              .filter((vout) => vout.scriptpubkey_address === wallet.address)
              .reduce((sum, vout) => sum + vout.value, 0);

            const receivedAmountBtc = receivedAmountSats / 1e8;
            const explorerUrl = `${MEMPOOL_EXPLORER_URL}${tx.txid}`;

            return (
              <li
                key={tx.txid}
                className="border-t border-muted-foreground/20 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0"
              >
                <div>
                  <p className="font-semibold text-sm text-muted-foreground">
                    {tx.status.block_time
                      ? new Date(tx.status.block_time * 1000).toLocaleString()
                      : "Date not available"}
                  </p>
                  <p className="font-mono text-lg text-emerald-400">
                    {receivedAmountBtc.toFixed(8)} BTC
                  </p>
                </div>
                <Link
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center"
                >
                  View on Explorer <ExternalLink className="ml-1.5 h-4 w-4" />
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};

export default PaymentsReceived;
