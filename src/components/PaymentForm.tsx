"use client";

import { useEffect, useState } from "react";
import { DollarSign, QrCode } from "lucide-react";
import Decimal from "decimal.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import { usePayment } from "@/contexts/PaymentContext";

const PaymentForm = () => {
  const { btcAmount, submitPaymentRequest } = usePayment();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const validateAmount = (value: string) => {
    if (!value) {
      return "Please enter a valid BTC amount.";
    }

    try {
      const numValue = new Decimal(value);
      if (numValue.isZero() || numValue.isNegative()) {
        return "Amount must be greater than 0.";
      }

      // Enforce max 8 decimal places for BTC
      if (numValue.decimalPlaces() > 8) {
        return "Amount cannot have more than 8 decimal places.";
      }
    } catch {
      return "Please enter a valid number.";
    }

    return "";
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Filter out non-numeric and multiple decimal points
    value = value.replace(/[^0-9.]/g, "");
    const parts = value.split(".");
    if (parts.length > 2) {
      value = parts[0] + "." + parts.slice(1).join("");
    }

    setAmount(value);
    if (error) {
      const validationError = validateAmount(value);
      setError(validationError);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateAmount(amount);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    const preciseAmount = new Decimal(amount);
    submitPaymentRequest(preciseAmount.toFixed(8));
  };

  useEffect(() => {
    if (btcAmount === "") {
      setAmount("");
      setError("");
    }
  }, [btcAmount]);

  return (
    <Card className="w-full shadow-2xl bg-card/80 backdrop-blur-sm animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center">
          <DollarSign className="mr-2 h-7 w-7 text-primary" />
          Enter BTC Amount to Request
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <Label
              htmlFor="amount"
              className="text-sm font-medium text-muted-foreground"
            >
              BTC Amount
            </Label>
            <Input
              id="amount"
              type="text"
              placeholder="e.g., 0.001"
              value={amount}
              onChange={handleAmountChange}
              className="text-lg font-semibold"
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
          <Button
            type="submit"
            className="w-full text-lg py-6 bg-blue-400 hover:bg-primary/90 text-white"
            disabled={!!error || !amount}
          >
            <QrCode className="w-5 h-5 mr-2" />
            Create Payment QR
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
