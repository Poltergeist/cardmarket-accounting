import {
  LedgerFile,
  Transaction,
  Posting,
} from "../../../core/domain/models/ledger";
import { ErrorHandler } from "../../../shared/utils/errorHandler";

export class JsonOrdersToLedgerMapper {
  mapToLedger(ordersWithArticles: any[]): LedgerFile {
    const ledgerFile = new LedgerFile();

    for (const orderData of ordersWithArticles) {
      const transactions = this.createTransactionsFromOrder(orderData);
      transactions.forEach((transaction) => {
        if (transaction) {
          ledgerFile.addTransaction(transaction);
        }
      });
    }

    return ledgerFile;
  }

  private createTransactionsFromOrder(orderData: any): Transaction[] {
    const transactions: Transaction[] = [];

    try {
      const order = orderData;
      const articles = orderData.articles || [];

      // Format date from the order
      const date = this.formatDate(order["Date of Purchase"]);
      const orderId = order.OrderID;
      const currency = order.Currency;
      const username = order.Username;

      // Create a transaction for the sale
      const saleTransaction: Transaction = {
        date,
        description: `Cardmarket Sale - ${username} (${orderId})`,
        postings: [
          // Revenue from merchandise
          {
            account: "Revenue:Cardmarket:Sales",
            amount: -order["Merchandise Value"],
            currency,
            comment: "Merchandise revenue",
          },
          // Shipping revenue
          {
            account: "Revenue:Cardmarket:Shipping",
            amount: -order["Shipment Costs"],
            currency,
            comment: "Shipping revenue",
          },
          // Commission expense
          {
            account: "Expenses:Cardmarket:Commission",
            amount: order.Commission,
            currency,
            comment: "Platform commission",
          },
          // Net receivable (will be calculated automatically by hledger)
          {
            account: "Assets:Cardmarket:Receivable",
            // amount will be calculated by hledger as the balancing amount
          },
        ],
        tags: {
          orderId: orderId,
          username: username,
          country: order.Country,
          isProfessional: order["Is Professional"].toString(),
        },
      };

      transactions.push(saleTransaction);

      // Create individual transactions for each article if needed for inventory tracking
      articles.forEach((article: any, index: number) => {
        const articleTransaction: Transaction = {
          date,
          description: `Article Sale - ${article["Localized Product Name"]} (${orderId})`,
          postings: [
            // Reduce inventory
            {
              account: "Assets:Inventory:Cards",
              amount: -article["Article Value"],
              currency: article.Currency,
              comment: `${article.Amount}x ${article.Article}`,
            },
            // Cost of goods sold
            {
              account: "Expenses:COGS:Cards",
              amount: article["Article Value"],
              currency: article.Currency,
              comment: `Cost basis for ${article.Article}`,
            },
          ],
          tags: {
            orderId: orderId,
            productId: article["Product ID"],
            expansion: article.Expansion,
            category: article.Category,
            shipmentNr: article["Shipment nr."],
          },
        };

        transactions.push(articleTransaction);
      });
    } catch (error) {
      ErrorHandler.warn(
        "Failed to create transaction from order",
        "JSON to Ledger mapping",
        {
          error,
          orderData,
        },
      );
    }

    return transactions;
  }

  private formatDate(date: Date | string): string {
    if (date instanceof Date) {
      return date.toISOString().split("T")[0];
    }

    // Handle string dates
    if (typeof date === "string") {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString().split("T")[0];
      }
    }

    // Fallback to current date if parsing fails
    return new Date().toISOString().split("T")[0];
  }
}
