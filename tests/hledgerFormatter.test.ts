import { HledgerFormatter } from "../src/core/services/hledgerFormatter";
import { LedgerFile, Transaction } from "../src/core/domain/models/ledger";
import fs from "fs";

// Mock fs module
jest.mock("fs", () => ({
  promises: {
    writeFile: jest.fn(),
  },
}));

const mockWriteFile = fs.promises.writeFile as jest.MockedFunction<
  typeof fs.promises.writeFile
>;

describe("HledgerFormatter", () => {
  let ledgerFile: LedgerFile;
  let formatter: HledgerFormatter;

  beforeEach(() => {
    ledgerFile = new LedgerFile();
    formatter = new HledgerFormatter(ledgerFile);
    jest.clearAllMocks();
  });

  describe("writeToFile", () => {
    it("should write ledger content to file", async () => {
      const transaction: Transaction = {
        date: "2023-10-01",
        description: "Test Transaction",
        postings: [
          { account: "Assets:Checking" },
          { account: "Expenses:Cards", amount: 100.0, currency: "USD" },
        ],
      };

      ledgerFile.addTransaction(transaction);
      const filePath = "/tmp/test.journal";

      await formatter.writeToFile(filePath);

      expect(mockWriteFile).toHaveBeenCalledWith(
        filePath,
        ledgerFile.toString(),
      );
      expect(mockWriteFile).toHaveBeenCalledTimes(1);
    });

    it("should handle empty ledger file", async () => {
      const filePath = "/tmp/empty.journal";

      await formatter.writeToFile(filePath);

      expect(mockWriteFile).toHaveBeenCalledWith(filePath, "");
    });
  });

  describe("validateTransaction", () => {
    it("should validate a correct transaction", () => {
      const validTransaction: Transaction = {
        date: "2023-10-01",
        description: "Valid Transaction",
        postings: [
          { account: "Assets:Checking" },
          { account: "Expenses:Cards", amount: 100.0, currency: "USD" },
        ],
      };

      expect(formatter.validateTransaction(validTransaction)).toBe(true);
    });

    it("should accept different date formats", () => {
      const transactionWithSlashes: Transaction = {
        date: "2023/10/01",
        description: "Valid Transaction",
        postings: [
          { account: "Assets:Checking" },
          { account: "Expenses:Cards", amount: 100.0, currency: "USD" },
        ],
      };

      const transactionWithDashes: Transaction = {
        date: "2023-10-01",
        description: "Valid Transaction",
        postings: [
          { account: "Assets:Checking" },
          { account: "Expenses:Cards", amount: 100.0, currency: "USD" },
        ],
      };

      expect(formatter.validateTransaction(transactionWithSlashes)).toBe(true);
      expect(formatter.validateTransaction(transactionWithDashes)).toBe(true);
    });

    it("should reject transaction with missing date", () => {
      const invalidTransaction: Transaction = {
        date: "",
        description: "Invalid Transaction",
        postings: [
          { account: "Assets:Checking" },
          { account: "Expenses:Cards", amount: 100.0, currency: "USD" },
        ],
      };

      expect(formatter.validateTransaction(invalidTransaction)).toBe(false);
    });

    it("should reject transaction with missing description", () => {
      const invalidTransaction: Transaction = {
        date: "2023-10-01",
        description: "",
        postings: [
          { account: "Assets:Checking" },
          { account: "Expenses:Cards", amount: 100.0, currency: "USD" },
        ],
      };

      expect(formatter.validateTransaction(invalidTransaction)).toBe(false);
    });

    it("should reject transaction with fewer than 2 postings", () => {
      const invalidTransaction: Transaction = {
        date: "2023-10-01",
        description: "Invalid Transaction",
        postings: [{ account: "Assets:Checking" }],
      };

      expect(formatter.validateTransaction(invalidTransaction)).toBe(false);
    });

    it("should reject transaction with invalid date format", () => {
      const invalidTransaction: Transaction = {
        date: "01/10/2023", // MM/DD/YYYY format is invalid
        description: "Invalid Transaction",
        postings: [
          { account: "Assets:Checking" },
          { account: "Expenses:Cards", amount: 100.0, currency: "USD" },
        ],
      };

      expect(formatter.validateTransaction(invalidTransaction)).toBe(false);
    });

    it("should reject transaction with malformed date", () => {
      const invalidTransaction: Transaction = {
        date: "not-a-date",
        description: "Invalid Transaction",
        postings: [
          { account: "Assets:Checking" },
          { account: "Expenses:Cards", amount: 100.0, currency: "USD" },
        ],
      };

      expect(formatter.validateTransaction(invalidTransaction)).toBe(false);
    });

    it("should reject transaction with no postings", () => {
      const invalidTransaction: Transaction = {
        date: "2023-10-01",
        description: "Invalid Transaction",
        postings: [],
      };

      expect(formatter.validateTransaction(invalidTransaction)).toBe(false);
    });
  });
});
