# ⚡ BTC Testnet QR Payment Generator

A Next.js-based web application that allows anyone to instantly generate Bitcoin Testnet payment requests via QR codes. It creates ephemeral HD wallets, displays payment information, and polls the blockchain in real-time to detect transaction confirmations.

![BTC QR App Screenshot](/public/app_home.png)

## Overview

This project is a tool designed to simplify the process of testing Bitcoin Testnet payment flows. It provides a seamless, single-page application experience with the following workflow:

**Live Demo:** [https://btc-qr-payment.vercel.app/](https://btc-qr-payment.vercel.app/)

1.  **Generate Wallet**: A new, temporary Bitcoin Testnet HD wallet is created for each session.
2.  **Set Amount**: The user specifies the amount of BTC to request.
3.  **Display QR Code**: A QR code representing a BIP-21 payment URI is generated for easy scanning with a testnet-compatible wallet.
4.  **Detect Payment**: The application automatically polls the blockchain to detect incoming payments and track their confirmation status.

The entire process requires no setup, no user accounts, and no API keys, making it a frictionless tool for developers.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Workflow](#workflow)
- [Project Structure](#project-structure)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Performance](#performance)
- [Configuration](#configuration)
- [Examples](#examples)
- [Contributing](#contributing)
- [Tests](#tests)
- [Future Improvements](#future-improvements)
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

## Workflow

This section illustrates the typical user flow from generating a wallet to receiving a payment confirmation.

### 1. Generate a New Wallet

The process begins by clicking the **"Generate Wallet"** button on the hero section. This creates a new, ephemeral testnet wallet for the session.

![Generate Wallet Step](/public/workflow_step_1_generate_wallet.png)

### 2. Enter Payment Amount

Once the wallet is generated, the user specifies the amount of BTC to request in the payment form and clicks **"Create Payment QR"**.

![Enter Amount Step](/public/workflow_step_2_enter_amount.png)

### 3. Scan the QR Code to Pay

The application generates and displays a BIP-21 compliant QR code. The user can scan this with any testnet-compatible mobile wallet to send the specified amount to the generated address.

![Scan QR Code Step](/public/workflow_step_3_scan_qr.png)

### 4. Monitor Payment Status

After the QR code is displayed, the application begins polling the blockchain. The UI provides real-time feedback as the transaction is detected in the mempool and then confirmed. A list of all received payments is also displayed.

![Monitor Payment Step](/public/workflow_step_4_monitor_payment.png)

![Completed Payment](/public/payment_completed.png)

## Features

- **Ephemeral HD Wallet Generation**: Creates a new BIP39-compliant Bitcoin Testnet wallet for each session using `bitcoinjs-lib`.
- **Dynamic QR Code Generation**: Generates a `BIP-21` payment URI and QR code based on the user-defined amount.
- **Real-time Payment Detection**: Polls the [Mempool.space Testnet API](https://mempool.space/testnet4/docs/api) to detect incoming transactions in real-time.
- **Transaction Confirmation Tracking**: Monitors transactions from the mempool until they are confirmed on the blockchain.
- **Responsive Design**: Fully responsive interface built with TailwindCSS and ShadCN, ensuring a seamless experience on both desktop and mobile devices.
- **Secure On-Demand Decryption**: To enhance security, the wallet's mnemonic and private key are encrypted on the server _before_ being sent to the client. They remain encrypted in the application's state and are only decrypted in the browser on-demand when the user explicitly chooses to view them. This prevents sensitive data from being exposed in plaintext in network responses or React component state.
- **Ephemeral & Secure**: No private keys or mnemonics are ever stored on a server. The wallet is generated client-side and exists only for the duration of the session.

## Tech Stack

This project is built with a modern, type-safe, and efficient stack:

| Category                | Technology / Library                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Core Framework**      | [Next.js](https://nextjs.org/) 15 (App Router), [React](https://react.dev/) 19                                                                         |
| **Language**            | [TypeScript](https://www.typescriptlang.org/)                                                                                                          |
| **Styling**             | [Tailwind CSS](https://tailwindcss.com/), [ShadCN/UI](https://ui.shadcn.com/)                                                                          |
| **Bitcoin & Wallet**    | [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib), [bip39](https://github.com/bitcoinjs/bip39), [bip32](https://github.com/bitcoinjs/bip32)  |
| **QR Code Generation**  | [qrcode.react](https://github.com/zpao/qrcode.react)                                                                                                   |
| **State Management**    | React Context                                                                                                                                          |
| **Testing**             | [Jest](https://jestjs.io/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/), [Cypress](https://www.cypress.io/) |
| **Blockchain Data API** | [Mempool.space](https://mempool.space/docs/api) Testnet API                                                                                            |
| **Deployment**          | [Vercel](https://vercel.com)                                                                                                                           |

## Performance

This application is optimized for performance, accessibility, and SEO, as measured by Google Lighthouse. It achieves top scores, ensuring a fast and user-friendly experience.

![Lighthouse Performance Report](/public/lighthouse_performance.png)

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

This project includes a comprehensive testing suite with both unit tests and end-to-end (E2E) tests to ensure application quality and correctness.

### Unit Tests

This project uses Jest for unit testing. The API routes have corresponding tests to ensure their logic is correct.

![Test Coverage](/public/test_coverage.png)

To run the unit test suite:

```bash
npm test
```

To run tests in watch mode:

```bash
npm run test:watch
```

### End-to-End (E2E) Tests

E2E tests are implemented using [Cypress](https://www.cypress.io/) to simulate real user workflows in a browser environment. This ensures that the entire application—from the UI to the backend APIs—works together as expected.

The primary E2E test covers the **"Happy Path"**:

1. Generating a wallet.
2. Creating a payment request.
3. Simulating the payment process from "Listening" to "Payment Confirmed".

**Running E2E Tests:**

1. **To open the Cypress Test Runner (interactive mode):**

   ```bash
   npm run cy:open
   ```

2. **To run all E2E tests headlessly in the terminal:**

   ```bash
   npm run cy:run:e2e
   ```

3. **To start the development server and run E2E tests automatically:**
   This is the recommended way to run E2E tests locally.
   ```bash
   npm run test:e2e
   ```

## Future Improvements

While the current application is fully functional for its intended purpose, there are several opportunities for future enhancements to improve its robustness, efficiency, and feature set.

### Architecture & Backend

- **API Layer Enhancements**: Implement rate limiting, caching, more sophisticated error handling, and retry mechanisms to make the backend more robust and resilient.
- **WebSocket Subscriptions**: Replace the current HTTP polling (`setInterval`) for payment checking with a real-time WebSocket subscription to a service like Mempool.space. This would provide instant updates and be more efficient than repeated polling.
- **Global State Management**: As the application grows, consider integrating a dedicated state management library (e.g., Zustand, Redux Toolkit) for more predictable and maintainable state logic.
- **Error Monitoring**: Integrate an error monitoring service like Sentry or LogRocket to proactively track, diagnose, and resolve issues in production.

### Features

- **Multi-Explorer Support**: Add an option to switch between different public blockchain data sources (e.g., Blockstream.info).
- **Payment Request Timeout**: Implement a user-facing timer that voids the payment request after a certain period (e.g., 15 minutes).
- **UI/UX Polish**: Introduce more fluid animations and page transitions with a library like Framer Motion to enhance the user experience.
- **Fiat Value Display**: Add a feature to show the real-time fiat value (e.g., in USD) of the requested BTC amount.

## License

This project is licensed under the MIT License.

## FAQ

**Is this safe to use with real Bitcoin?**

> **NO.** This application is for **Testnet purposes only**. It is a tool for testing and experimentation and does not follow the security best practices required for handling real funds.

**Where is my wallet information stored?**

> Your wallet's mnemonic and private keys are generated and stored only in your browser's memory for the current session. They are never sent to the server or stored anywhere else. Once you close the tab, they are gone forever.

**What is a Bitcoin Testnet?**

> The Bitcoin Testnet is an alternative Bitcoin blockchain, to be used for testing. Testnet coins are separate and distinct from actual bitcoins, have no value, and can be obtained for free from faucets.
