import { GET } from "../route";
import { NextResponse } from "next/server";

// Mock the NextResponse.json method
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));

jest.mock("decimal.js", () => {
  const DecimalMock = jest.fn().mockImplementation((value) => {
    if (value === "invalid") {
      return { toNumber: () => NaN };
    }
    return { toNumber: () => parseFloat(value) };
  });

  return {
    __esModule: true,
    default: DecimalMock,
  };
});

// Mock fetch
global.fetch = jest.fn();

describe("GET /api/check-payment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to create a mock Request with search params
  const createRequest = (params: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    const url = `https://example.com/api/check-payment?${searchParams.toString()}`;
    return { url } as Request;
  };

  describe("Input validation", () => {
    test("returns 400 when address is missing", async () => {
      const req = createRequest({
        amount: "10000",
        requestTimestamp: "1609459200000",
      });

      await GET(req);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Address is required" },
        { status: 400 }
      );
    });

    test("returns 400 when amount is missing", async () => {
      const req = createRequest({
        address: "tb1qtest",
        requestTimestamp: "1609459200000",
      });

      await GET(req);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Amount is required" },
        { status: 400 }
      );
    });

    test("returns 400 when requestTimestamp is missing", async () => {
      const req = createRequest({ address: "tb1qtest", amount: "10000" });

      await GET(req);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Request timestamp is required" },
        { status: 400 }
      );
    });

    test("returns 400 when amount is invalid", async () => {
      const req = createRequest({
        address: "tb1qtest",
        amount: "invalid",
        requestTimestamp: "1609459200000",
      });

      await GET(req);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Invalid amount" },
        { status: 400 }
      );
    });

    test("returns 400 when requestTimestamp is invalid", async () => {
      const req = createRequest({
        address: "tb1qtest",
        amount: "10000",
        requestTimestamp: "invalid",
      });

      await GET(req);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Invalid request timestamp" },
        { status: 400 }
      );
    });
  });

  describe("Payment status detection", () => {
    const validParams = {
      address: "tb1qtest",
      amount: "10000",
      requestTimestamp: "1609459200000", // 2021-01-01
    };

    test("returns LISTENING status when no transactions exist", async () => {
      const req = createRequest(validParams);

      // Mock the API to return an empty array of transactions
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await GET(req);

      expect(NextResponse.json).toHaveBeenCalledWith({
        paymentStatus: {
          status: "LISTENING",
          message: "Listening for payment...",
        },
        receivedPayments: [],
      });
    });

    test("returns PAYMENT_DETECTED status for unconfirmed transaction", async () => {
      const req = createRequest(validParams);

      // Mock transaction that matches the address/amount but is unconfirmed
      const mockTx = {
        txid: "test_txid",
        status: {
          confirmed: false,
        },
        vout: [
          {
            scriptpubkey_address: "tb1qtest",
            value: 15000, // Higher than requested amount
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockTx],
      });

      await GET(req);

      expect(NextResponse.json).toHaveBeenCalledWith({
        paymentStatus: {
          status: "PAYMENT_DETECTED",
          message: "Payment detected in mempool! Awaiting confirmation.",
          details: {
            transactionId: "test_txid",
            receivedAmountSatoshis: 15000,
            expectedAmountSatoshis: 10000,
          },
        },
        receivedPayments: [],
      });
    });

    test("returns CONFIRMING status for transaction with insufficient confirmations", async () => {
      const req = createRequest(validParams);

      const requestTimestamp = parseInt(validParams.requestTimestamp, 10);
      const blockTime = Math.floor(requestTimestamp / 1000) + 3600; // 1 hour after request

      // Mock confirmed transaction but with insufficient confirmations
      const mockTx = {
        txid: "test_txid",
        status: {
          confirmed: true,
          block_time: blockTime,
          block_height: 700000,
        },
        vout: [
          {
            scriptpubkey_address: "tb1qtest",
            value: 12000,
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockTx],
      });

      // Mock tip height to return a height that gives 0 confirmations (height - 1)
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => 699999, // One block BEFORE = 0 confirmations
      });

      await GET(req);

      expect(NextResponse.json).toHaveBeenCalledWith({
        paymentStatus: {
          status: "CONFIRMING",
          message: "Confirming... (0/1)",
          details: {
            transactionId: "test_txid",
            receivedAmountSatoshis: 12000,
            expectedAmountSatoshis: 10000,
            confirmations: 0,
          },
        },
        receivedPayments: [mockTx],
      });
    });

    test("returns PAYMENT_CONFIRMED status for fully confirmed transaction", async () => {
      const req = createRequest(validParams);

      const requestTimestamp = parseInt(validParams.requestTimestamp, 10);
      const blockTime = Math.floor(requestTimestamp / 1000) + 3600; // 1 hour after request

      // Mock confirmed transaction with sufficient confirmations
      const mockTx = {
        txid: "test_txid",
        status: {
          confirmed: true,
          block_time: blockTime,
          block_height: 700000,
        },
        vout: [
          {
            scriptpubkey_address: "tb1qtest",
            value: 12000,
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockTx],
      });

      // Mock tip height to return a height that gives more confirmations than threshold
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => 700010, // 11 blocks ahead = 11 confirmations
      });

      await GET(req);

      expect(NextResponse.json).toHaveBeenCalledWith({
        paymentStatus: {
          status: "PAYMENT_CONFIRMED",
          message: "Payment confirmed and complete.",
          details: {
            transactionId: "test_txid",
            receivedAmountSatoshis: 12000,
            expectedAmountSatoshis: 10000,
            confirmations: 11,
          },
        },
        receivedPayments: [mockTx],
      });
    });
  });

  describe("Error handling", () => {
    test("returns API_ERROR status when transaction fetch fails", async () => {
      const req = createRequest({
        address: "tb1qtest",
        amount: "10000",
        requestTimestamp: "1609459200000",
      });

      // Mock fetch to fail with a network error
      (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      await GET(req);

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          paymentStatus: {
            status: "API_ERROR",
            message: "Failed to check payment status.",
            details: { error: "Network error" },
          },
          receivedPayments: [],
        },
        { status: 502 }
      );
    });

    test("returns API_ERROR status when transactions API returns non-OK response", async () => {
      const req = createRequest({
        address: "tb1qtest",
        amount: "10000",
        requestTimestamp: "1609459200000",
      });

      // Mock transactions API to return a non-OK response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        text: async () => "API Error",
      });

      await GET(req);

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          paymentStatus: {
            status: "API_ERROR",
            message: "Failed to check payment status.",
            details: { error: "Failed to fetch transactions: API Error" },
          },
          receivedPayments: [],
        },
        { status: 502 }
      );
    });

    test("returns API_ERROR status when tip height API returns non-OK response", async () => {
      const req = createRequest({
        address: "tb1qtest",
        amount: "10000",
        requestTimestamp: "1609459200000",
      });

      // Mock a confirmed transaction that will require checking confirmations
      const mockTx = {
        txid: "test_txid",
        status: {
          confirmed: true,
          block_time:
            Math.floor(
              parseInt(req.url.split("requestTimestamp=")[1], 10) / 1000
            ) + 3600,
          block_height: 700000,
        },
        vout: [
          {
            scriptpubkey_address: "tb1qtest",
            value: 12000,
          },
        ],
      };

      // First fetch succeeds (get transactions)
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockTx],
      });

      // Second fetch fails (get tip height)
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        text: async () => "Tip Height API Error",
      });

      await GET(req);

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          paymentStatus: {
            status: "API_ERROR",
            message: "Failed to check payment status.",
            details: {
              error:
                "Failed to fetch blockchain tip height: Tip Height API Error",
            },
          },
          receivedPayments: [],
        },
        { status: 502 }
      );
    });
  });

  describe("Payment filtering logic", () => {
    test("correctly filters received payments after requestTimestamp", async () => {
      const requestTimestamp = 1609459200000; // 2021-01-01
      const req = createRequest({
        address: "tb1qtest",
        amount: "10000",
        requestTimestamp: requestTimestamp.toString(),
      });

      const oldBlockTime = Math.floor(requestTimestamp / 1000) - 3600; // 1 hour before request
      const newBlockTime = Math.floor(requestTimestamp / 1000) + 3600; // 1 hour after request

      // Mock a mix of old and new transactions
      const mockTransactions = [
        // Old transaction (should not be in receivedPayments)
        {
          txid: "old_tx",
          status: {
            confirmed: true,
            block_time: oldBlockTime,
            block_height: 699990,
          },
          vout: [
            {
              scriptpubkey_address: "tb1qtest",
              value: 5000,
            },
          ],
        },
        // New transaction (should be in receivedPayments)
        {
          txid: "new_tx",
          status: {
            confirmed: true,
            block_time: newBlockTime,
            block_height: 700000,
          },
          vout: [
            {
              scriptpubkey_address: "tb1qtest",
              value: 12000,
            },
          ],
        },
        // Unconfirmed transaction (should not be in receivedPayments)
        {
          txid: "unconfirmed_tx",
          status: {
            confirmed: false,
          },
          vout: [
            {
              scriptpubkey_address: "tb1qtest",
              value: 15000,
            },
          ],
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTransactions,
      });

      // Mock tip height
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => 700010,
      });

      await GET(req);

      // We expect only the new confirmed transaction to be included in receivedPayments
      const response = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.receivedPayments).toHaveLength(1);
      expect(response.receivedPayments[0].txid).toBe("new_tx");

      // The payment status should be PAYMENT_CONFIRMED since we have a transaction
      // that meets the amount requirement and is confirmed
      expect(response.paymentStatus.status).toBe("PAYMENT_CONFIRMED");
    });
  });
});
