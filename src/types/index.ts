export interface BtcWallet {
  address: string;
  mnemonic: string;
  privateKeyWIF: string;
}

export interface Transaction {
  txid: string;
  version: number;
  locktime: number;
  vin: Vin[];
  vout: Vout[];
  size: number;
  weight: number;
  fee: number;
  status: Status;
}

export interface Vin {
  txid: string;
  vout: number;
  prevout: Prevout;
  scriptsig: string;
  scriptsig_asm: string;
  witness: string[];
  is_coinbase: boolean;
  sequence: number;
}

export interface Prevout {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address: string;
  value: number;
}

export interface Vout {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address: string;
  value: number;
}

export interface Status {
  confirmed: boolean;
  block_height?: number;
  block_hash?: string;
  block_time?: number;
}

export type PaymentStatusEnum =
  | "LISTENING"
  | "PAYMENT_DETECTED"
  | "CONFIRMING"
  | "PAYMENT_CONFIRMED"
  | "ERROR_UNDERPAID"
  | "ERROR_MULTIPLE"
  | "API_ERROR"
  | "TIMEOUT";

export interface PaymentStatus {
  status: PaymentStatusEnum;
  message: string;
  details?: {
    transactionId?: string;
    receivedAmountSatoshis?: number;
    expectedAmountSatoshis?: number;
    confirmations?: number;
    error?: string;
  };
}
