import { NextResponse } from "next/server";
import Decimal from "decimal.js";
import { Transaction } from "@/types";

const MEMPOOL_API_URL_TESTNET = "https://mempool.space/testnet4/api";
const CONFIRMATION_THRESHOLD = 1; // On testnet, 1 confirmation is sufficient. Use 6 for mainnet.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const amountStr = searchParams.get("amount");

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }
  if (!amountStr) {
    return NextResponse.json({ error: "Amount is required" }, { status: 400 });
  }

  const amountToSatoshis = new Decimal(amountStr).toNumber();

  if (isNaN(amountToSatoshis) || amountToSatoshis <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  try {
    const txsResponse = await fetch(
      `${MEMPOOL_API_URL_TESTNET}/address/${address}/txs`
    );

    if (!txsResponse.ok) {
      throw new Error(
        `Failed to fetch transactions: ${await txsResponse.text()}`
      );
    }
    const transactions: Transaction[] = await txsResponse.json();

    const relevantTxs = transactions.filter((tx) =>
      tx.vout.some((output) => output.scriptpubkey_address === address)
    );

    if (relevantTxs.length === 0) {
      return NextResponse.json({
        status: "LISTENING",
        message: "Listening for payment...",
      });
    }

    if (relevantTxs.length > 1) {
      return NextResponse.json({
        status: "ERROR_MULTIPLE",
        message: "Multiple payments detected. Please contact support.",
      });
    }

    const tx = relevantTxs[0];
    const relevantVout = tx.vout.find(
      (output) => output.scriptpubkey_address === address
    );

    if (!relevantVout) {
      // This case should not be reached due to the filter logic above
      throw new Error("Could not find a relevant transaction output.");
    }

    const receivedAmountSatoshis = relevantVout.value;

    if (receivedAmountSatoshis < amountToSatoshis) {
      return NextResponse.json({
        status: "ERROR_UNDERPAID",
        message: `An underpayment was received. Expected at least ${amountToSatoshis} satoshis but got ${receivedAmountSatoshis}.`,
        details: {
          transactionId: tx.txid,
          receivedAmountSatoshis,
          expectedAmountSatoshis: amountToSatoshis,
        },
      });
    }

    if (!tx.status.confirmed) {
      return NextResponse.json({
        status: "PAYMENT_DETECTED",
        message: "Payment detected in mempool! Awaiting confirmation.",
        details: {
          transactionId: tx.txid,
          receivedAmountSatoshis,
          expectedAmountSatoshis: amountToSatoshis,
        },
      });
    }

    const tipHeightResponse = await fetch(
      `${MEMPOOL_API_URL_TESTNET}/blocks/tip/height`
    );
    if (!tipHeightResponse.ok) {
      throw new Error(
        `Failed to fetch blockchain tip height: ${await tipHeightResponse.text()}`
      );
    }
    const currentBlockHeight = await tipHeightResponse.json();
    const txBlockHeight = tx.status.block_height;

    if (typeof txBlockHeight !== "number") {
      throw new Error("Transaction confirmed but missing block height.");
    }

    const confirmations = currentBlockHeight - txBlockHeight + 1;

    if (confirmations < CONFIRMATION_THRESHOLD) {
      return NextResponse.json({
        status: "CONFIRMING",
        message: `Confirming... (${confirmations}/${CONFIRMATION_THRESHOLD})`,
        details: {
          transactionId: tx.txid,
          receivedAmountSatoshis,
          expectedAmountSatoshis: amountToSatoshis,
          confirmations,
        },
      });
    }

    return NextResponse.json({
      status: "PAYMENT_CONFIRMED",
      message: "Payment confirmed and complete.",
      details: {
        transactionId: tx.txid,
        receivedAmountSatoshis,
        expectedAmountSatoshis: amountToSatoshis,
        confirmations,
      },
    });
  } catch (error) {
    console.error("Error in check-payment API:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      {
        status: "API_ERROR",
        message: "Failed to check payment status.",
        details: { error: errorMessage },
      },
      { status: 502 }
    );
  }
}
