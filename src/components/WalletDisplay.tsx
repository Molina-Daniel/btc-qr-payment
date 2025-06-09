"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ClipboardCopy,
  AlertTriangle,
  WalletCards,
  EyeOff,
  Eye,
} from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

const WalletDisplay = () => {
  const { wallet } = useWallet();
  const [isMnemonicVisible, setIsMnemonicVisible] = useState(false);
  const [isPrivateKeyVisible, setIsPrivateKeyVisible] = useState(false);

  if (!wallet) return null;

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <Card className="w-full max-w-lg shadow-2xl bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-headline">
          <WalletCards className="mr-3 h-7 w-7 text-primary" />
          New Testnet Wallet Generated
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <Label
            htmlFor="btcAddress"
            className="text-sm font-medium text-muted-foreground"
          >
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
          <Label htmlFor="mnemonic" className="text-sm text-muted-foreground">
            Mnemonic Phrase
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="mnemonic"
              readOnly
              value={
                isMnemonicVisible
                  ? wallet.mnemonic
                  : "••• ••• ••• ••• ••• ••• ••• ••• ••• ••• ••• •••"
              }
              className="font-code text-sm flex-grow"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMnemonicVisible(!isMnemonicVisible)}
            >
              {isMnemonicVisible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            {isMnemonicVisible && (
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  handleCopyToClipboard(wallet.mnemonic, "Mnemonic")
                }
              >
                <ClipboardCopy className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div>
          <Label
            htmlFor="privateKeyWIF"
            className="text-sm text-muted-foreground"
          >
            Private Key (WIF)
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="privateKeyWIF"
              readOnly
              value={
                // Even when visible, we only show a masked version for security
                // The full key can be copied using the button
                isPrivateKeyVisible
                  ? `${wallet.privateKeyWIF.substring(
                      0,
                      10
                    )}...${wallet.privateKeyWIF.substring(
                      wallet.privateKeyWIF.length - 10
                    )}`
                  : "•••••••••••••••••••••••••••••"
              }
              className="font-code text-sm flex-grow"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsPrivateKeyVisible(!isPrivateKeyVisible)}
            >
              {isPrivateKeyVisible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                handleCopyToClipboard(wallet.privateKeyWIF, "Private Key")
              }
            >
              <ClipboardCopy className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-3 text-xs text-amber-500 flex items-center">
            <AlertTriangle className="mr-2 h-14 w-14 text-amber-600" /> This
            wallet is generated locally in your browser. We do not store your
            mnemonic or private key, so please save them carefully if you wish
            to recover this wallet later. Do not share these secrets. For
            testnet use only.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletDisplay;
