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
      "Merchandise Value": 25.5,
      "Shipment Costs": 5.0,
      "Total Value": 30.5,
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
          "Article Value": 15.0,
          Total: 15.0,
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
          "Article Value": 10.5,
          Total: 10.5,
          Currency: "EUR",
          Comments: "Played condition",
        },
      ],
    };

    const ledgerFile = mapper.mapToLedger([testOrderWithArticles]);

    expect(ledgerFile.transactions).toHaveLength(1); // 1 comprehensive transaction with all postings

    // Test the consolidated transaction
    const saleTransaction = ledgerFile.transactions[0];
    expect(saleTransaction.date).toBe("2024-01-15");
    expect(saleTransaction.description).toBe(
      "Cardmarket Sale - testuser (ORDER123)",
    );
    expect(saleTransaction.postings).toHaveLength(9); // 3 postings per article + 2 shipping + 1 balance

    // Check article revenue postings (per article with Uncategorized since no box ID in comments)
    const lightningRevenuePosting = saleTransaction.postings.find(
      (p) =>
        p.account === "Revenue:Cardmarket:Sales:Uncategorized" &&
        p.comment?.includes("Lightning Bolt"),
    );
    expect(lightningRevenuePosting?.amount).toBe(-15.0);
    expect(lightningRevenuePosting?.currency).toBe("EUR");

    const blackLotusRevenuePosting = saleTransaction.postings.find(
      (p) =>
        p.account === "Revenue:Cardmarket:Sales:Uncategorized" &&
        p.comment?.includes("Black Lotus"),
    );
    expect(blackLotusRevenuePosting?.amount).toBe(-10.5);
    expect(blackLotusRevenuePosting?.currency).toBe("EUR");

    // Check commission postings (5% of each article's total)
    const commissionPostings = saleTransaction.postings.filter(
      (p) => p.account === "Expenses:Cardmarket:Commission:Uncategorized",
    );
    expect(commissionPostings).toHaveLength(2);
    expect(commissionPostings[0]?.amount).toBe(0.75); // 5% of 15.00
    expect(commissionPostings[1]?.amount).toBe(0.53); // 5% of 10.50 (rounded up)

    // Check receivable postings per article
    const receivablePostings = saleTransaction.postings.filter(
      (p) => p.account === "Assets:Cardmarket:Receivable:Uncategorized",
    );
    expect(receivablePostings).toHaveLength(2);
    expect(receivablePostings[0]?.amount).toBe(14.25); // 15.00 - 0.75
    expect(receivablePostings[1]?.amount).toBe(9.97); // 10.50 - 0.53

    // Check shipping posting
    const shippingRevenuePosting = saleTransaction.postings.find(
      (p) => p.account === "Revenue:Cardmarket:Shipping",
    );
    expect(shippingRevenuePosting?.amount).toBe(-5.0);
    expect(shippingRevenuePosting?.currency).toBe("EUR");

    const shippingReceivablePosting = saleTransaction.postings.find(
      (p) => p.account === "Assets:Cardmarket:Receivable:shipping",
    );
    expect(shippingReceivablePosting?.amount).toBe(5.0);
    expect(shippingReceivablePosting?.currency).toBe("EUR");

    // Check balancing receivable posting (no amount specified, will balance automatically)
    const balancingPosting = saleTransaction.postings.find(
      (p) => p.account === "Assets:Cardmarket:Receivable" && !p.amount,
    );
    expect(balancingPosting).toBeDefined();

    // Check tags
    expect(saleTransaction.tags?.orderId).toBe("ORDER123");
    expect(saleTransaction.tags?.username).toBe("testuser");
    expect(saleTransaction.tags?.country).toBe("Germany");
    expect(saleTransaction.tags?.isProfessional).toBe("false");
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
    expect(ledgerFile.transactions[0].description).toBe(
      "Cardmarket Sale - testuser2 (ORDER124)",
    );
  });
});
