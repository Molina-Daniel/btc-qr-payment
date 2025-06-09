import { Zap } from "lucide-react";

const Header = () => {
  return (
    <header className="py-6">
      <div className="container mx-auto flex justify-center sm:justify-start">
        <div className="flex items-center space-x-2 text-2xl font-semibold text-primary">
          <Zap size={28} className="text-primary" />
          <span className="font-headline">TestnetPay</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
