"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClipboardCopy, AlertTriangle, WalletCards } from "lucide-react";
import { BtcWallet } from "@/types";

const WalletDisplay = ({ wallet }: { wallet: BtcWallet }) => {
  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    console.log(`${label} copied to clipboard`);
  };

  return (
    <Card className="w-full max-w-lg shadow-2xl bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-headline">
          <WalletCards className="mr-3 h-7 w-7 text-primary" />
          New Testnet Wallet Generated
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="btcAddress" className="text-sm text-muted-foreground">
            BTC Address (Testnet)
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="btcAddress"
              readOnly
              value={wallet.address}
              className="font-code text-sm flex-grow"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopyToClipboard(wallet.address, "Address")}
            >
              <ClipboardCopy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div>
          <p className="mt-1 text-xs text-amber-500 flex items-center">
            <AlertTriangle size={14} className="mr-1 text-amber-600" /> This
            wallet is ephemeral and not recoverable. For testnet use only.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletDisplay;
