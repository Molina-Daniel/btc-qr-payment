describe("Payment Happy Path Workflow", () => {
  beforeEach(() => {
    // Disable encryption for tests
    cy.intercept("GET", "/api/generate-wallet", (req) => {
      req.continue((res) => {
        // Replace the response with a mock wallet
        res.body = {
          address: "tb1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxz9a",
          mnemonic: {
            ciphertext: "test-encrypted-mnemonic",
            iv: "test-iv",
            tag: "test-tag",
          },
          privateKeyWIF: {
            ciphertext: "test-encrypted-wif",
            iv: "test-iv",
            tag: "test-tag",
          },
        };
      });
    }).as("generateWallet");
  });

  it("should successfully complete the payment workflow", () => {
    // 1. Visit the home page
    cy.visit("/");
    cy.contains("Bitcoin Testnet").should("be.visible");

    // 2. Generate a new wallet
    cy.generateWallet();
    cy.wait("@generateWallet");

    // Verify wallet display is visible
    cy.get('[data-testid="btc-address"]')
      .should("have.value", "tb1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxz9a")
      .and("be.visible");
    cy.get('[data-testid="payment-form"]').should("be.visible");

    // 3. Mock the payment status endpoints before submitting the form
    cy.mockPaymentStatus("payment-listening");

    // 4. Enter amount and submit the form
    cy.enterAmount("0.0012345");

    // 5. Verify the QR code and payment status are displayed
    cy.get('[data-testid="payment-qr"]').should("be.visible");
    cy.get('[data-testid="payment-status"]').should("be.visible");
    cy.get('[data-testid="payment-status"]')
      .contains("Listening for payment...")
      .should("be.visible");

    // 6. Simulate payment detection
    cy.mockPaymentStatus("payment-detected");

    // Wait for the polling interval (assuming it's 5 seconds)
    cy.wait(15000);

    // Verify payment detection is shown
    cy.get('[data-testid="payment-status"]')
      .contains("Payment detected")
      .should("be.visible");

    // 7. Simulate payment confirmation
    cy.mockPaymentStatus("payment-confirmed");

    // Wait for the polling interval
    cy.wait(15000);

    // Verify payment confirmation is shown
    cy.get('[data-testid="payment-status"]')
      .contains("Payment confirmed")
      .should("be.visible");

    // 8. Verify that received payments are displayed
    cy.get('[data-testid="payments-received"]').should("be.visible");
    cy.get('[data-testid="payments-received"]')
      .contains("View on Explorer")
      .should("be.visible");
    cy.get('[data-testid="payments-received"]')
      .contains("0.00123450 BTC")
      .should("be.visible");
  });
});
