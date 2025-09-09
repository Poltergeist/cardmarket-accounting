import {
  LedgerFile,
  Transaction,
  Posting,
} from "../../../core/domain/models/ledger";
import { ErrorHandler } from "../../../shared/utils/errorHandler";

function extractBoxIdFromComments(comments?: string): string | undefined {
  if (!comments) return undefined;
  // First "#<digits>" is the box id (e.g., "#401 #101" -> "401")
  const m = comments.match(/#(\d+)/);
  return m ? m[1] : undefined;
}

export class JsonOrdersToLedgerMapper {
  mapToLedger(ordersWithArticles: any[]): LedgerFile {
    const ledgerFile = new LedgerFile();

    for (const orderData of ordersWithArticles) {
      const transaction = this.createTransactionFromOrder(orderData);
      if (transaction) {
        ledgerFile.addTransaction(transaction);
      }
    }

    return ledgerFile;
  }

  private createTransactionFromOrder(orderData: any): Transaction | null {
    try {
      const order = orderData;
      const articles = orderData.articles || [];

      // Format date from the order
      const date = this.formatDate(order["Date of Purchase"]);
      const orderId = order.OrderID;
      const currency = order.Currency;
      const username = order.Username;
      let commission = 0;

      // Build per-article revenue lines (so revenue is attributable per box)
      const perArticleRevenuePostings: Posting[] = articles.reduce(
        (acc: Posting[], article: any) => {
          const boxId = extractBoxIdFromComments(article.Comments);
          const amount = -article["Total"]; // sale price per article
          const articleCurrency = article.Currency || currency;
          const commisionForArticle = Math.ceil(amount * -1 * 0.05 * 100) / 100;
          commission += Math.ceil(amount * -1 * 0.05 * 100) / 100;

          const details: string[] = [];
          if (boxId) details.push(`box:${boxId}`);
          details.push(`${article.Amount}x ${article.Article}`);
          details.push(` = ${amount * -1}`);

          acc = [
            ...acc,
            {
              account: `Revenue:Cardmarket:Sales:${boxId || "Uncategorized"}`,
              amount,
              currency: articleCurrency,
              comment: details.join(" "),
            },
            {
              account: `Expenses:Cardmarket:Commission:${boxId || "Uncategorized"}`,
              amount: commisionForArticle,
              currency: articleCurrency,
            },
            {
              account: `Assets:Cardmarket:Receivable:${boxId || "Uncategorized"}`,
              amount: Math.round((amount + commisionForArticle) * -100) / 100,
              currency: articleCurrency,
            },
          ];
          return acc;
        },
        [],
      );

      // Optional: aggregate box tags at transaction-level for convenience
      const boxIds = Array.from(
        new Set(
          (articles || [])
            .map((a: any) => extractBoxIdFromComments(a.Comments))
            .filter(Boolean) as string[],
        ),
      );

      const commissionsAdjustments = [];
      if (order.Commission !== commission) {
        commissionsAdjustments.push({
          account: "expenses:cardmarket:commission:adjustment",
          amount: Math.round((order.Commission - commission) * 100) / 100,
          currency,
          comment: "adjustment to fix commission mismatch",
        });
      }

      const postings: Posting[] = [
        ...perArticleRevenuePostings,
        // Shipping revenue (credit)
        {
          account: "Revenue:Cardmarket:Shipping",
          amount: -order["Shipment Costs"],
          currency,
          comment: "Shipping revenue",
        },
        {
          account: "Assets:Cardmarket:Receivable:shipping",
          amount: order["Shipment Costs"],
          currency,
          comment: "Shipping revenue",
        },
        // Commission expense (debit)
        // ...commissionsAdjustments,
        // Net receivable (balancing amount, no explicit amount)
        {
          account: "Assets:Cardmarket:Receivable",
        },
      ];

      // NOTE: Inventory/COGS per article should be added here once box cost allocation is available.
      // When ready, for each article:
      //   - credit  Assets:Inventory:Cards   costBasisPerArticle
      //   - debit   Expenses:COGS:Cards      costBasisPerArticle
      // Include `box:<id>` in the posting comment so COGS is attributable per box.

      const saleTransaction: Transaction = {
        date,
        description: `Cardmarket Sale - ${username} (${orderId})`,
        postings,
        tags: {
          orderId: orderId,
          username: username,
          country: order.Country,
          isProfessional: order["Is Professional"]?.toString?.(),
          ...(boxIds.length ? { boxes: boxIds.join(",") } : {}),
        },
      };

      return saleTransaction;
    } catch (error) {
      ErrorHandler.warn(
        "Failed to create transaction from order",
        "JSON to Ledger mapping",
        {
          error,
          orderData,
        },
      );
      return null;
    }
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
