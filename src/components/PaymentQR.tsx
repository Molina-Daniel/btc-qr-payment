import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { ClipboardCopy, QrCodeIcon, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { usePayment } from "@/contexts/PaymentContext";

const PaymentQR = () => {
  const { wallet } = useWallet();
  const { btcAmount, resetState } = usePayment();

  if (!wallet || !btcAmount) return null;

  // Create a Bitcoin URI for the QR code
  const bitcoinUri = `bitcoin:${wallet.address}?amount=${btcAmount}`;
  const truncatedAddress = `${wallet.address.slice(
    0,
    8
  )}...${wallet.address.slice(-8)}`;

  const handleCopyUri = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <Card className="w-full shadow-2xl bg-card/80 backdrop-blur-sm animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center justify-center">
          <QrCodeIcon className="mr-3 h-7 w-7 text-primary" /> Scan to Pay
          (Testnet)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="p-4 bg-white rounded-lg inline-block shadow-md">
          <QRCodeSVG value={bitcoinUri} size={200} />
        </div>
        <div className="text-sm text-muted-foreground font-code break-all">
          <p>
            Address:{" "}
            <code className="text-primary font-semibold">
              {truncatedAddress}
            </code>
          </p>
          <p>
            Amount:{" "}
            <span className="text-emerald-400 font-semibold">
              {btcAmount} BTC
            </span>
          </p>
        </div>
        <div className="flex-col space-y-8 mt-20 w-full flex items-center justify-center">
          <Button
            variant="outline"
            onClick={() => handleCopyUri(bitcoinUri, "Bitcoin URI")}
          >
            <ClipboardCopy className="mr-2 h-4 w-4" /> Copy Bitcoin URI
          </Button>
          <Button
            onClick={resetState}
            size="lg"
            className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <RefreshCw className="mr-2 h-5 w-5" /> Create Another Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentQR;
