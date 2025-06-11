/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
Cypress.Commands.add("generateWallet", () => {
  cy.get('[data-testid="generate-wallet-button"]').click();
  cy.get('[data-testid="wallet-display"]').should("be.visible");
});

Cypress.Commands.add("enterAmount", (amount: string) => {
  cy.get('input[id="amount"]').should("be.visible").type(amount);
  cy.get('[data-testid="create-payment-qr-button"]').click();
});

Cypress.Commands.add("mockPaymentStatus", (statusFixture: string) => {
  cy.intercept("GET", "/api/check-payment*", { fixture: statusFixture }).as(
    statusFixture
  );
});

// Add TypeScript definitions
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to click the "Generate Wallet" button and wait for wallet display
     * @example cy.generateWallet()
     */
    generateWallet(): void;

    /**
     * Custom command to enter payment amount and submit the form
     * @example cy.enterAmount('0.0001')
     */
    enterAmount(amount: string): void;

    /**
     * Custom command to mock the payment status API response
     * @example cy.mockPaymentStatus('payment-listening')
     */
    mockPaymentStatus(statusFixture: string): void;
  }
}
