# ⚡ BTC Testnet QR Payment Generator

A Next.js-based web application that allows developers to instantly generate Bitcoin Testnet payment requests via QR codes. It creates ephemeral HD wallets, displays payment information, and polls the blockchain in real-time to detect transaction confirmations.

![BTC QR App Screenshot](https://user-images.githubusercontent.com/1355416/188311218-971762c7-01e4-411a-969c-4a33a8a3b839.png)

## Description

This project is a developer tool designed to simplify the process of testing Bitcoin Testnet payment flows. It provides a seamless, single-page application experience with the following workflow:

1.  **Generate Wallet**: A new, temporary Bitcoin Testnet HD wallet is created for each session.
2.  **Set Amount**: The user specifies the amount of BTC to request.
3.  **Display QR Code**: A QR code representing a BIP-21 payment URI is generated for easy scanning with a testnet-compatible wallet.
4.  **Detect Payment**: The application automatically polls the blockchain to detect incoming payments and track their confirmation status.

The entire process requires no setup, no user accounts, and no API keys, making it a frictionless tool for developers.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Features](#features)
- [Configuration](#configuration)
- [Examples](#examples)
- [Contributing](#contributing)
- [Tests](#tests)
- [Roadmap](#roadmap)
- [License](#license)
- [FAQ](#faq)

## Installation

To run this project locally, you'll need [Node.js](https://nodejs.org/) (v20 or higher) and `npm` installed.

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Molina-Daniel/btc-qr-payment.git
    cd btc-qr-payment
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a file named `.env.local` in the root of the project. You will need to generate a 32-byte (256-bit) encryption key.

    You can use the following command in your terminal to generate a secure key:

    ```bash
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    ```

    Copy the generated key and add it to your `.env.local` file:

    ```
    NEXT_PUBLIC_ENCRYPTION_KEY=your_generated_64_character_hex_key_here
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

## Project Structure

The project follows a standard Next.js 15 App Router structure. Key directories and files are organized as follows:

```
/
├── public/                  # Static assets
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── check-payment/ # API route for checking payment status
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── route.test.ts
│   │   │   │   └── route.ts
│   │   │   └── generate-wallet/ # API route for generating a new wallet
│   │   │       ├── __tests__/
│   │   │       │   └── route.test.ts
│   │   │       └── route.ts
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main page component
│   │
│   ├── components/
│   │   ├── ui/                # Reusable ShadCN UI components (Button, Card, etc.)
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── HeroSection.tsx
│   │   ├── PaymentForm.tsx
│   │   ├── PaymentQR.tsx
│   │   ├── PaymentStatus.tsx
│   │   ├── PaymentsReceived.tsx
│   │   └── WalletDisplay.tsx
│   │
│   ├── contexts/
│   │   ├── AppProviders.tsx   # Combines all context providers
│   │   ├── PaymentContext.tsx # Manages payment state (amount, status, etc.)
│   │   └── WalletContext.tsx  # Manages wallet state (address, mnemonic)
│   │
│   ├── lib/
│   │   ├── crypto.ts          # Cryptographic and wallet-related functions
│   │   └── utils.ts           # Utility functions
│   │
│   └── types/
│       └── index.ts           # TypeScript type definitions
│
├── jest.config.ts           # Jest configuration
├── next.config.mjs          # Next.js configuration
└── tailwind.config.ts       # TailwindCSS configuration
```

## Usage

Once the application is running, follow these steps:

1.  Open your browser and navigate to `http://localhost:3000`.
2.  Click the **"Generate Wallet"** button to create a new testnet wallet. The address and mnemonic will be displayed.
3.  Enter the desired BTC amount in the input field and click **"Create Payment QR"**.
4.  Scan the generated QR code with a Bitcoin testnet wallet (e.g., Electrum in testnet mode, or a mobile wallet that supports testnet).
5.  Send the payment. The application will monitor the blockchain and update the payment status in real-time, from "Payment Detected" to "Confirming" and finally "Payment Confirmed".

## Features

- **Ephemeral HD Wallet Generation**: Creates a new BIP39-compliant Bitcoin Testnet wallet for each session using `bitcoinjs-lib`.
- **Dynamic QR Code Generation**: Generates a `BIP-21` payment URI and QR code based on the user-defined amount.
- **Real-time Payment Detection**: Polls the [Mempool.space Testnet API](https://mempool.space/testnet4/docs/api) to detect incoming transactions in real-time.
- **Transaction Confirmation Tracking**: Monitors transactions from the mempool until they are confirmed on the blockchain.
- **Responsive Design**: Fully responsive interface built with TailwindCSS and ShadCN, ensuring a seamless experience on both desktop and mobile devices.
- **Secure On-Demand Decryption**: To enhance security, the wallet's mnemonic and private key are encrypted on the server _before_ being sent to the client. They remain encrypted in the application's state and are only decrypted in the browser on-demand when the user explicitly chooses to view them. This prevents sensitive data from being exposed in plaintext in network responses or React component state.
- **Ephemeral & Secure**: No private keys or mnemonics are ever stored on a server. The wallet is generated client-side and exists only for the duration of the session.

## Configuration

This project requires one environment variable to be set up for handling the encryption of wallet secrets.

### Environment Variable

- `NEXT_PUBLIC_ENCRYPTION_KEY`: A 64-character (32-byte) hex string used as the key for AES-256-GCM encryption.

Create a `.env.local` file in the project's root directory and set the variable as described in the [Installation](#installation) section. The application uses this key to both encrypt secrets on the server-side API route and decrypt them on the client-side when requested by the user.

## Examples

### Requesting a Payment

The primary use case is to generate a payment request. The application creates a Bitcoin URI like the following and embeds it in the QR code:

`bitcoin:tb1q...z9a?amount=0.001`

### Monitoring Payment Status

The UI provides real-time feedback as the payment progresses:

- **LISTENING**: Waiting for a transaction to be broadcast.
- **PAYMENT_DETECTED**: Transaction found in the mempool.
- **CONFIRMING**: Transaction included in a block but has not yet reached the confirmation threshold.
- **PAYMENT_CONFIRMED**: Transaction is fully confirmed.
- **API_ERROR**: An error occurred while fetching data from the blockchain API.

## Contributing

Contributions are welcome! If you have suggestions for improvements, please open an issue or create a pull request.

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a pull request.

## Tests

This project uses Jest for unit testing. The API routes have corresponding tests to ensure their logic is correct.

To run the test suite:

```bash
npm test
```

To run tests in watch mode:

```bash
npm run test:watch
```

## Roadmap

- [ ] Add support for different public blockchain explorers.
- [ ] Implement a timeout for payment requests.
- [ ] Add more animations and UI transitions for a smoother user experience.
- [ ] Integrate a BTC-to-fiat conversion display.
- [ ] Add i18n support for multiple languages.

## License

This project is licensed under the MIT License.

## FAQ

**Is this safe to use with real Bitcoin?**

> **NO.** This application is for **Testnet purposes only**. It is a developer tool and does not follow the security best practices required for handling real funds.

**Where is my wallet information stored?**

> Your wallet's mnemonic and private keys are generated and stored only in your browser's memory for the current session. They are never sent to the server or stored anywhere else. Once you close the tab, they are gone forever.

**What is a Bitcoin Testnet?**

> The Bitcoin Testnet is an alternative Bitcoin blockchain, to be used for testing. Testnet coins are separate and distinct from actual bitcoins, have no value, and can be obtained for free from faucets.
