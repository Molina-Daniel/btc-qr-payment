import { NextResponse } from "next/server";
import * as bitcoin from "bitcoinjs-lib";
import * as bip39 from "bip39";
import * as ecc from "tiny-secp256k1";
import BIP32Factory from "bip32";
import type { BtcWallet } from "@/types/index";
import { encrypt } from "@/lib/crypto";

const bip32 = BIP32Factory(ecc); // Initialize bip32 with ecc

const TESTNET = bitcoin.networks.testnet;

// BIP84 derivation path for P2WPKH (Native SegWit) on Testnet
// m / purpose' / coin_type' / account' / change / address_index
// coin_type' is 1 for Testnet
const DERIVATION_PATH = "m/84'/1'/0'/0/0";

export async function GET() {
  try {
    // 1. Generates a 12-word BIP39 mnemonic (default 128-bit entropy).
    const mnemonic = bip39.generateMnemonic();

    // 2. Converts mnemonic to a 512-bit seed for BIP32.
    const seed = await bip39.mnemonicToSeed(mnemonic);

    // 3. Initializes the HD root node from the seed.
    const root = bip32.fromSeed(seed, TESTNET);

    // 4. Derives a child node based on the path. This gives a private/public keypair.
    const child = root.derivePath(DERIVATION_PATH);

    // 5. Generates a P2WPKH address (Native SegWit for Testnet, starts with tb1q)
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: Buffer.from(child.publicKey),
      network: TESTNET,
    });

    if (!address) {
      throw new Error("Failed to generate address.");
    }

    // 6. Gets the private key in WIF format.
    // Note: This is the private key for the derived child, not the master root.
    const privateKeyWIF = child.toWIF();

    // 7. Encrypt sensitive data
    const encryptedMnemonic = encrypt(mnemonic);
    const encryptedPrivateKeyWIF = encrypt(privateKeyWIF);

    const wallet: BtcWallet = {
      address,
      mnemonic: encryptedMnemonic,
      privateKeyWIF: encryptedPrivateKeyWIF,
    };

    return NextResponse.json(wallet);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Unknown error generating wallet"
    );
  }
}
