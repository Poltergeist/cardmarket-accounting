import { ExpenseMapper } from "../scripts/import-expenses";

describe("ExpenseMapper", () => {
  let mapper: ExpenseMapper;

  beforeEach(() => {
    mapper = new ExpenseMapper();
  });

  describe("mapCsvToLedger", () => {
    it("should map code 900 to shipping stamps account", () => {
      const csvData = [
        {
          Timestamp: "8/29/2025 14:10:24",
          Name: "Deutsche Post",
          Code: "900",
          Amount: "14.49",
          Datum: "8/29/2025",
          Kommentar: "",
        },
      ];

      const ledgerFile = mapper.mapCsvToLedger(csvData);

      expect(ledgerFile.transactions).toHaveLength(1);

      const transaction = ledgerFile.transactions[0];
      expect(transaction.date).toBe("2025-08-29");
      expect(transaction.description).toBe("Deutsche Post");
      expect(transaction.postings).toHaveLength(2);

      // Check expense posting
      const expensePosting = transaction.postings.find(
        (p) => p.account === "Expenses:Cardmarket:Shipping:stamps",
      );
      expect(expensePosting?.amount).toBe(14.49);
      expect(expensePosting?.currency).toBe("EUR");

      // Check balancing posting
      const balancingPosting = transaction.postings.find(
        (p) => p.account === "Assets:Cardmarket:Receivable:Shipping",
      );
      expect(balancingPosting?.amount).toBe(-14.49);
      expect(balancingPosting?.currency).toBe("EUR");

      // Check tags
      expect(transaction.tags?.comment).toBe(
        "Code: 900 | Timestamp: 8/29/2025 14:10:24",
      );
    });

    it("should map code 901 to shipping stationary account", () => {
      const csvData = [
        {
          Timestamp: "8/30/2025 8:57:40",
          Name: "Office Supply Store",
          Code: "901",
          Amount: "25.99",
          Datum: "8/30/2025",
          Kommentar: "Paper and pens",
        },
      ];

      const ledgerFile = mapper.mapCsvToLedger(csvData);

      expect(ledgerFile.transactions).toHaveLength(1);

      const transaction = ledgerFile.transactions[0];
      expect(transaction.date).toBe("2025-08-30");

      const expensePosting = transaction.postings.find(
        (p) => p.account === "Expenses:Cardmarket:Shipping:Stationary",
      );
      expect(expensePosting?.amount).toBe(25.99);

      const balancingPosting = transaction.postings.find(
        (p) => p.account === "Assets:Cardmarket:Receivable:Shipping",
      );
      expect(balancingPosting?.amount).toBe(-25.99);
    });

    it("should map code 902 to TCG power tools account", () => {
      const csvData = [
        {
          Timestamp: "9/1/2025 12:00:00",
          Name: "Tool Store",
          Code: "902",
          Amount: "89.99",
          Datum: "9/1/2025",
          Kommentar: "New tools",
        },
      ];

      const ledgerFile = mapper.mapCsvToLedger(csvData);

      expect(ledgerFile.transactions).toHaveLength(1);

      const transaction = ledgerFile.transactions[0];

      const expensePosting = transaction.postings.find(
        (p) => p.account === "Expenses:Cardmarket:TCGPowerTools",
      );
      expect(expensePosting?.amount).toBe(89.99);

      const balancingPosting = transaction.postings.find(
        (p) => p.account === "Assets:Cardmarket:Receivable:Operations",
      );
      expect(balancingPosting?.amount).toBe(-89.99);
    });

    it("should map other codes to product account", () => {
      const csvData = [
        {
          Timestamp: "9/2/2025 15:30:00",
          Name: "Product Supplier",
          Code: "408",
          Amount: "150.00",
          Datum: "9/2/2025",
          Kommentar: "Box contents",
        },
      ];

      const ledgerFile = mapper.mapCsvToLedger(csvData);

      expect(ledgerFile.transactions).toHaveLength(1);

      const transaction = ledgerFile.transactions[0];

      const expensePosting = transaction.postings.find(
        (p) => p.account === "Expenses:Cardmarket:Product:408",
      );
      expect(expensePosting?.amount).toBe(150.0);

      const balancingPosting = transaction.postings.find(
        (p) => p.account === "Assets:Cardmarket:Receivable:408",
      );
      expect(balancingPosting?.amount).toBe(-150.0);
    });

    it("should handle multiple transactions", () => {
      const csvData = [
        {
          Timestamp: "8/29/2025 14:10:24",
          Name: "Deutsche Post",
          Code: "900",
          Amount: "14.49",
          Datum: "8/29/2025",
          Kommentar: "",
        },
        {
          Timestamp: "8/30/2025 8:57:40",
          Name: "Deutsche Post",
          Code: "900",
          Amount: "0.95",
          Datum: "8/30/2025",
          Kommentar: "",
        },
        {
          Timestamp: "9/3/2025 8:23:40",
          Name: "Deutsche Post",
          Code: "900",
          Amount: "9.30",
          Datum: "9/3/2025",
          Kommentar: "",
        },
      ];

      const ledgerFile = mapper.mapCsvToLedger(csvData);

      expect(ledgerFile.transactions).toHaveLength(3);

      // Check dates are properly parsed
      expect(ledgerFile.transactions[0].date).toBe("2025-08-29");
      expect(ledgerFile.transactions[1].date).toBe("2025-08-30");
      expect(ledgerFile.transactions[2].date).toBe("2025-09-03");

      // Check amounts
      expect(ledgerFile.transactions[0].postings[0].amount).toBe(14.49);
      expect(ledgerFile.transactions[1].postings[0].amount).toBe(0.95);
      expect(ledgerFile.transactions[2].postings[0].amount).toBe(9.3);
    });

    it("should skip rows with missing required fields", () => {
      const csvData = [
        {
          Timestamp: "8/29/2025 14:10:24",
          Name: "Deutsche Post",
          Code: "900",
          Amount: "14.49",
          Datum: "8/29/2025",
          Kommentar: "",
        },
        {
          Timestamp: "8/30/2025 8:57:40",
          Name: "Deutsche Post",
          // Missing Code
          Amount: "0.95",
          Datum: "8/30/2025",
          Kommentar: "",
        },
        {
          Timestamp: "9/3/2025 8:23:40",
          Name: "Deutsche Post",
          Code: "900",
          // Missing Amount
          Datum: "9/3/2025",
          Kommentar: "",
        },
      ];

      const ledgerFile = mapper.mapCsvToLedger(csvData);

      // Only the first valid row should be processed
      expect(ledgerFile.transactions).toHaveLength(1);
      expect(ledgerFile.transactions[0].postings[0].amount).toBe(14.49);
    });

    it("should handle empty and extra columns gracefully", () => {
      const csvData = [
        {
          Timestamp: "8/29/2025 14:10:24",
          Name: "Deutsche Post",
          Code: "900",
          Amount: "14.49",
          Datum: "8/29/2025",
          Kommentar: "",
          "": "", // Empty column
          " ": "", // Space column
          ExtraColumn: "should be ignored",
        },
      ];

      const ledgerFile = mapper.mapCsvToLedger(csvData);

      expect(ledgerFile.transactions).toHaveLength(1);
      expect(ledgerFile.transactions[0].postings[0].amount).toBe(14.49);
    });
  });
});
