import { Info, AlertTriangle, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="py-8 border-t border-border/50 bg-card/30 mt-60">
      <div className="container mx-auto text-center text-muted-foreground space-y-4">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center text-lg">
            <Info size={20} className="mr-2 text-primary" /> About This Tool
          </div>
          <p className="text-sm max-w-xl">
            This is a developer tool for simulating Bitcoin Testnet payment
            flows. It uses HD wallets generated on the fly and checks public
            block explorers for transaction confirmations. Built with:{" "}
            <span className="font-code">Next.js</span>,{" "}
            <span className="font-code">bitcoinjs-lib</span>,{" "}
            <span className="font-code">TailwindCSS</span>.
          </p>
          <p className="text-xs text-amber-500 flex items-center">
            <AlertTriangle size={14} className="mr-1 text-amber-600" /> Warning:
            Testnet only — not for real BTC.
          </p>
        </div>
        <Button variant="ghost" asChild>
          <a
            href="https://github.com/Molina-Daniel/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center"
          >
            <Github className="mr-2 h-5 w-5" /> View on GitHub
          </a>
        </Button>
        <p className="text-xs">
          &copy; {new Date().getFullYear()} TestnetPay. All rights reserved (not
          really, it&apos;s a demo).
        </p>
      </div>
    </footer>
  );
};

export default Footer;
