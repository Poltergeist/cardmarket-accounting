export interface Transaction {
  date: string;
  description: string;
  postings: Posting[];
  tags?: Record<string, string>;
}

export interface Posting {
  account: string;
  amount?: number;
  currency?: string;
  comment?: string;
}

export class LedgerFile {
  transactions: Transaction[] = [];

  addTransaction(transaction: Transaction): void {
    this.transactions.push(transaction);
  }

  toString(): string {
    return this.transactions
      .map((transaction) => {
        const header = `${transaction.date} ${transaction.description}`;
        const postings = transaction.postings
          .map((posting) => {
            const amount =
              posting.amount !== undefined
                ? `${posting.amount} ${posting.currency || ""}`
                : "";
            return `    ${posting.account}${amount ? "  " + amount : ""}${posting.comment ? "  ; " + posting.comment : ""}`;
          })
          .join("\n");

        const tags = transaction.tags
          ? Object.entries(transaction.tags)
              .map(([key, value]) => `    ; ${key}: ${value}`)
              .join("\n")
          : "";

        return `${header}\n${postings}${tags ? "\n" + tags : ""}`;
      })
      .join("\n\n");
  }
}
