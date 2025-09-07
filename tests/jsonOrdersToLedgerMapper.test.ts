import { JsonOrdersToLedgerMapper } from "../src/features/orders-parse/mappers/jsonOrdersToLedgerMapper";

describe("JsonOrdersToLedgerMapper", () => {
  let mapper: JsonOrdersToLedgerMapper;

  beforeEach(() => {
    mapper = new JsonOrdersToLedgerMapper();
  });

  it("should map order with articles to ledger transactions", () => {
    const testOrderWithArticles = {
      OrderID: "ORDER123",
      Username: "testuser",
      Name: "Test User",
      Street: "Test Street 123", 
      City: "Test City",
      Country: "Germany",
      "Is Professional": false,
      "VAT Number": "",
      "Date of Purchase": new Date("2024-01-15"),
      "Article Count": 2,
      "Merchandise Value": 25.50,
      "Shipment Costs": 5.00,
      "Total Value": 30.50,
      Commission: 2.55,
      Currency: "EUR",
      Description: "Test order description",
      "Product ID": "PROD123",
      "Localized Product Name": "Test Product",
      articles: [
        {
          "Shipment nr.": "SHIP001",
          "Date of purchase": new Date("2024-01-15"),
          Article: "Lightning Bolt",
          "Product ID": "MTG123",
          "Localized Product Name": "Lightning Bolt (English)",
          Expansion: "Alpha",
          Category: "Magic Single",
          Amount: 1,
          "Article Value": 15.00,
          Total: 15.00,
          Currency: "EUR",
          Comments: "Near Mint condition",
        },
        {
          "Shipment nr.": "SHIP001", 
          "Date of purchase": new Date("2024-01-15"),
          Article: "Black Lotus",
          "Product ID": "MTG456",
          "Localized Product Name": "Black Lotus (English)",
          Expansion: "Alpha",
          Category: "Magic Single",
          Amount: 1,
          "Article Value": 10.50,
          Total: 10.50,
          Currency: "EUR",
          Comments: "Played condition",
        },
      ],
    };

    const ledgerFile = mapper.mapToLedger([testOrderWithArticles]);

    expect(ledgerFile.transactions).toHaveLength(3); // 1 main sale + 2 article transactions

    // Test main sale transaction
    const saleTransaction = ledgerFile.transactions[0];
    expect(saleTransaction.date).toBe("2024-01-15");
    expect(saleTransaction.description).toBe("Cardmarket Sale - testuser (ORDER123)");
    expect(saleTransaction.postings).toHaveLength(4);
    
    // Check revenue posting
    const revenuePosting = saleTransaction.postings.find(p => p.account === "Revenue:Cardmarket:Sales");
    expect(revenuePosting?.amount).toBe(-25.50);
    expect(revenuePosting?.currency).toBe("EUR");

    // Check shipping posting
    const shippingPosting = saleTransaction.postings.find(p => p.account === "Revenue:Cardmarket:Shipping");
    expect(shippingPosting?.amount).toBe(-5.00);
    expect(shippingPosting?.currency).toBe("EUR");

    // Check commission posting
    const commissionPosting = saleTransaction.postings.find(p => p.account === "Expenses:Cardmarket:Commission");
    expect(commissionPosting?.amount).toBe(2.55);
    expect(commissionPosting?.currency).toBe("EUR");

    // Check tags
    expect(saleTransaction.tags?.orderId).toBe("ORDER123");
    expect(saleTransaction.tags?.username).toBe("testuser");
    expect(saleTransaction.tags?.country).toBe("Germany");

    // Test article transactions
    const articleTransaction1 = ledgerFile.transactions[1];
    expect(articleTransaction1.description).toContain("Lightning Bolt (English)");
    expect(articleTransaction1.postings).toHaveLength(2);

    const articleTransaction2 = ledgerFile.transactions[2];
    expect(articleTransaction2.description).toContain("Black Lotus (English)");
    expect(articleTransaction2.postings).toHaveLength(2);
  });

  it("should handle empty orders array", () => {
    const ledgerFile = mapper.mapToLedger([]);
    expect(ledgerFile.transactions).toHaveLength(0);
  });

  it("should handle order without articles", () => {
    const orderWithoutArticles = {
      OrderID: "ORDER124",
      Username: "testuser2",
      Name: "Test User 2",
      Street: "Test Street 456",
      City: "Test City",
      Country: "France",
      "Is Professional": true,
      "VAT Number": "FR123456789",
      "Date of Purchase": new Date("2024-01-16"),
      "Article Count": 0,
      "Merchandise Value": 0,
      "Shipment Costs": 0,
      "Total Value": 0,
      Commission: 0,
      Currency: "EUR",
      Description: "Empty order",
      "Product ID": "",
      "Localized Product Name": "",
      articles: [],
    };

    const ledgerFile = mapper.mapToLedger([orderWithoutArticles]);

    expect(ledgerFile.transactions).toHaveLength(1); // Only main sale transaction
    expect(ledgerFile.transactions[0].description).toBe("Cardmarket Sale - testuser2 (ORDER124)");
  });
});