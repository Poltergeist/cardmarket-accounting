import { LedgerFile, Transaction } from "../src/core/domain/models/ledger";

describe("LedgerFile", () => {
  let ledgerFile: LedgerFile;

  beforeEach(() => {
    ledgerFile = new LedgerFile();
  });

  describe("addTransaction", () => {
    it("should add a transaction to the ledger file", () => {
      const transaction: Transaction = {
        date: "2023-10-01",
        description: "Sample Transaction",
        postings: [
          { account: "Assets:Checking" },
          { account: "Expenses:Cards", amount: 150.0, currency: "USD" },
        ],
      };

      ledgerFile.addTransaction(transaction);

      expect(ledgerFile.transactions).toHaveLength(1);
      expect(ledgerFile.transactions[0]).toEqual(transaction);
    });

    it("should handle multiple transactions", () => {
      const transaction1: Transaction = {
        date: "2023-10-01",
        description: "First Transaction",
        postings: [
          { account: "Assets:Checking" },
          { account: "Expenses:Cards", amount: 100.0, currency: "USD" },
        ],
      };

      const transaction2: Transaction = {
        date: "2023-10-02",
        description: "Second Transaction",
        postings: [
          { account: "Assets:Checking" },
          { account: "Expenses:Food", amount: 50.0, currency: "USD" },
        ],
      };

      ledgerFile.addTransaction(transaction1);
      ledgerFile.addTransaction(transaction2);

      expect(ledgerFile.transactions).toHaveLength(2);
    });
  });

  describe("toString", () => {
    it("should format a simple transaction correctly", () => {
      const transaction: Transaction = {
        date: "2023-10-01",
        description: "Sample Transaction",
        postings: [
          { account: "Assets:Checking" },
          { account: "Expenses:Cards", amount: 150.0, currency: "USD" },
        ],
      };

      ledgerFile.addTransaction(transaction);
      const result = ledgerFile.toString();

      expect(result).toContain("2023-10-01 Sample Transaction");
      expect(result).toContain("Assets:Checking");
      expect(result).toContain("Expenses:Cards  150 USD");
    });

    it("should format transaction with comments", () => {
      const transaction: Transaction = {
        date: "2023-10-01",
        description: "Transaction with Comments",
        postings: [
          { account: "Assets:Checking", comment: "From checking account" },
          {
            account: "Expenses:Cards",
            amount: 150.0,
            currency: "USD",
            comment: "Card purchase",
          },
        ],
      };

      ledgerFile.addTransaction(transaction);
      const result = ledgerFile.toString();

      expect(result).toContain("; From checking account");
      expect(result).toContain("; Card purchase");
    });

    it("should format transaction with tags", () => {
      const transaction: Transaction = {
        date: "2023-10-01",
        description: "Transaction with Tags",
        postings: [
          { account: "Assets:Checking" },
          { account: "Expenses:Cards", amount: 150.0, currency: "USD" },
        ],
        tags: { "cardmarket-order": "123456", "payment-method": "paypal" },
      };

      ledgerFile.addTransaction(transaction);
      const result = ledgerFile.toString();

      expect(result).toContain("; cardmarket-order: 123456");
      expect(result).toContain("; payment-method: paypal");
    });

    it("should handle empty ledger file", () => {
      const result = ledgerFile.toString();
      expect(result).toBe("");
    });

    it("should format multiple transactions correctly", () => {
      const transaction1: Transaction = {
        date: "2023-10-01",
        description: "First Transaction",
        postings: [
          { account: "Assets:Checking" },
          { account: "Expenses:Cards", amount: 100.0, currency: "USD" },
        ],
      };

      const transaction2: Transaction = {
        date: "2023-10-02",
        description: "Second Transaction",
        postings: [
          { account: "Assets:Checking" },
          { account: "Expenses:Food", amount: 50.0, currency: "EUR" },
        ],
      };

      ledgerFile.addTransaction(transaction1);
      ledgerFile.addTransaction(transaction2);
      const result = ledgerFile.toString();

      expect(result).toContain("2023-10-01 First Transaction");
      expect(result).toContain("2023-10-02 Second Transaction");
      expect(result).toContain("Expenses:Cards  100 USD");
      expect(result).toContain("Expenses:Food  50 EUR");

      // Should have double newline between transactions
      expect(result.split("\n\n")).toHaveLength(2);
    });
  });
});
