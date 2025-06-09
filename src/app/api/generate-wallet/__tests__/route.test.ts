// Mock NextResponse first
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data) => ({
      status: 200,
      json: async () => data,
    })),
  },
}));

jest.mock("bitcoinjs-lib", () => ({
  networks: {
    testnet: { someTestnetProperty: "test" },
  },
  payments: {
    p2wpkh: jest.fn(() => ({ address: "tb1qtest123456789" })),
  },
}));

jest.mock("bip39", () => ({
  generateMnemonic: jest.fn(
    () =>
      "test word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
  ),
  mnemonicToSeed: jest.fn(() => Promise.resolve(Buffer.from("mockedseed"))),
}));

jest.mock("tiny-secp256k1", () => ({
  // Add minimum required properties
  isPoint: jest.fn(),
  isPrivate: jest.fn(),
  pointFromScalar: jest.fn(),
  pointAddScalar: jest.fn(),
  privateAdd: jest.fn(),
  privateSub: jest.fn(),
  sign: jest.fn(),
  verify: jest.fn(),
}));

// Create a mock child node and derivePath
const mockChild = {
  publicKey: Buffer.from("mockpublickey"),
  toWIF: jest.fn(() => "mockprivatekeywif"),
};

const mockDerivePath = jest.fn(() => mockChild);

const mockRoot = {
  derivePath: mockDerivePath,
};

// Mock BIP32Factory
jest.mock("bip32", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    fromSeed: jest.fn(() => mockRoot),
  })),
}));

// Import modules after all mocks are defined
import { GET } from "../route";
import * as bitcoinjs from "bitcoinjs-lib";
import * as bip39 from "bip39";
import { NextResponse } from "next/server";

describe("Generate Wallet API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a wallet with address, mnemonic, and privateKeyWIF", async () => {
    const response = await GET();
    const responseData = await response.json();

    expect(responseData).toHaveProperty("address", "tb1qtest123456789");
    expect(responseData).toHaveProperty(
      "mnemonic",
      "test word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
    );
    expect(responseData).toHaveProperty("privateKeyWIF", "mockprivatekeywif");
    expect(NextResponse.json).toHaveBeenCalled();
  });

  it("should use the correct parameters for testnet and derivation path", async () => {
    await GET();

    expect(mockDerivePath).toHaveBeenCalledWith("m/84'/1'/0'/0/0");

    expect(bitcoinjs.payments.p2wpkh).toHaveBeenCalledWith({
      pubkey: expect.any(Buffer),
      network: bitcoinjs.networks.testnet,
    });
  });

  it("should handle errors correctly", async () => {
    (bip39.generateMnemonic as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Mock error generating mnemonic");
    });

    await expect(GET()).rejects.toThrow("Mock error generating mnemonic");

    (bip39.generateMnemonic as jest.Mock).mockReturnValue(
      "test word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
    );
  });

  it("should handle address generation failure", async () => {
    (bitcoinjs.payments.p2wpkh as jest.Mock).mockImplementationOnce(() => ({
      address: null,
    }));

    await expect(GET()).rejects.toThrow("Failed to generate address.");

    (bitcoinjs.payments.p2wpkh as jest.Mock).mockImplementation(() => ({
      address: "tb1qtest123456789",
    }));
  });
});
