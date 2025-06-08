import { NextResponse } from "next/server";
import Decimal from "decimal.js";
import { PaymentStatus, Transaction } from "@/types";

const MEMPOOL_API_URL_TESTNET = "https://mempool.space/testnet4/api";
const CONFIRMATION_THRESHOLD = 1; // On testnet, 1 confirmation is sufficient. Use 6 for mainnet.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const amountStr = searchParams.get("amount");
  const requestTimestampStr = searchParams.get("requestTimestamp");

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }
  if (!amountStr) {
    return NextResponse.json({ error: "Amount is required" }, { status: 400 });
  }
  if (!requestTimestampStr) {
    return NextResponse.json(
      { error: "Request timestamp is required" },
      { status: 400 }
    );
  }

  const amountToSatoshis = new Decimal(amountStr).toNumber();
  const requestTimestamp = parseInt(requestTimestampStr, 10);

  if (isNaN(amountToSatoshis) || amountToSatoshis <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  if (isNaN(requestTimestamp)) {
    return NextResponse.json(
      { error: "Invalid request timestamp" },
      { status: 400 }
    );
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
    const allTransactions: Transaction[] = await txsResponse.json();

    // Find all newly confirmed transactions since the request was made.
    const receivedPayments = allTransactions.filter(
      (tx) =>
        tx.status.confirmed &&
        tx.vout.some((output) => output.scriptpubkey_address === address) &&
        tx.status.block_time &&
        tx.status.block_time * 1000 >= requestTimestamp
    );

    // Identify potential candidates for the current payment request.
    // This includes unconfirmed transactions or transactions confirmed after the request time.
    const paymentCandidates = allTransactions.filter((tx) => {
      const isNew =
        !tx.status.confirmed ||
        (tx.status.block_time &&
          tx.status.block_time * 1000 >= requestTimestamp);
      if (!isNew) return false;

      return tx.vout.some(
        (output) =>
          output.scriptpubkey_address === address &&
          output.value >= amountToSatoshis
      );
    });

    let paymentStatus: PaymentStatus;

    if (paymentCandidates.length === 0) {
      paymentStatus = {
        status: "LISTENING",
        message: "Listening for payment...",
      };
    } else {
      // For simplicity, we'll track the first valid candidate we find.
      // A more advanced system might sort them by confirmation status or time.
      const tx = paymentCandidates[0];
      const relevantVout = tx.vout.find(
        (output) =>
          output.scriptpubkey_address === address &&
          output.value >= amountToSatoshis
      );

      // This should always be found because of the filter above, but we check for type safety.
      if (!relevantVout) {
        throw new Error(
          "Logic error: Could not find relevant vout in candidate."
        );
      }
      const receivedAmountSatoshis = relevantVout.value;

      if (!tx.status.confirmed) {
        paymentStatus = {
          status: "PAYMENT_DETECTED",
          message: "Payment detected in mempool! Awaiting confirmation.",
          details: {
            transactionId: tx.txid,
            receivedAmountSatoshis,
            expectedAmountSatoshis: amountToSatoshis,
          },
        };
      } else {
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
          paymentStatus = {
            status: "CONFIRMING",
            message: `Confirming... (${confirmations}/${CONFIRMATION_THRESHOLD})`,
            details: {
              transactionId: tx.txid,
              receivedAmountSatoshis,
              expectedAmountSatoshis: amountToSatoshis,
              confirmations,
            },
          };
        } else {
          paymentStatus = {
            status: "PAYMENT_CONFIRMED",
            message: "Payment confirmed and complete.",
            details: {
              transactionId: tx.txid,
              receivedAmountSatoshis,
              expectedAmountSatoshis: amountToSatoshis,
              confirmations,
            },
          };
        }
      }
    }

    return NextResponse.json({
      paymentStatus,
      receivedPayments,
    });
  } catch (error) {
    console.error("Error in check-payment API:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    const apiErrorStatus: PaymentStatus = {
      status: "API_ERROR",
      message: "Failed to check payment status.",
      details: { error: errorMessage },
    };
    return NextResponse.json(
      { paymentStatus: apiErrorStatus, receivedPayments: [] },
      { status: 502 }
    );
  }
}
