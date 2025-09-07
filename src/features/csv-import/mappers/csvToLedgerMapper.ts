import {
  LedgerFile,
  Transaction,
  Posting,
} from "../../../core/domain/models/ledger";
import { ImportOptions } from "../../../core/domain/interfaces/importers";
import { ErrorHandler } from "../../../shared/utils/errorHandler";

export class CsvToLedgerMapper {
  private options: ImportOptions;

  constructor(options: ImportOptions) {
    this.options = options;
  }

  mapToLedger(csvData: any[]): LedgerFile {
    const ledgerFile = new LedgerFile();

    for (const row of csvData) {
      const transaction = this.createTransaction(row);
      if (transaction) {
        ledgerFile.addTransaction(transaction);
      }
    }

    return ledgerFile;
  }

  private createTransaction(row: any): Transaction | null {
    // Map CSV format to Transaction
    // This is a simplified example - you'd want to customize this based on your CSV format
    try {
      const dateField = this.detectDateField(row);
      const descriptionField = this.detectDescriptionField(row);
      const amountField = this.detectAmountField(row);
      const categoryField = this.detectCategoryField(row);

      if (!dateField || !amountField) {
        ErrorHandler.warn(
          "Skipping row: could not detect required fields",
          "CSV to Ledger mapping",
          { row },
        );
        return null;
      }

      const date = this.formatDate(row[dateField]);
      const amount = parseFloat(row[amountField].replace(/[^0-9.-]+/g, ""));
      const description = descriptionField
        ? row[descriptionField] || "Unspecified transaction"
        : "Unspecified transaction";

      // Default accounts - ideally these would come from mappings
      const expenseAccount =
        categoryField && row[categoryField]
          ? `Expenses:${row[categoryField]}`
          : "Expenses:Uncategorized";

      const transaction: Transaction = {
        date,
        description,
        postings: [
          {
            account: "Assets:Checking",
            amount: -amount,
            currency: this.options.defaultCurrency || "USD",
          },
          {
            account: expenseAccount,
            amount: amount,
            currency: this.options.defaultCurrency || "USD",
          },
        ],
      };

      return transaction;
    } catch (error) {
      ErrorHandler.warn(
        "Failed to create transaction from row",
        "CSV to Ledger mapping",
        { row, error },
      );
      return null;
    }
  }

  // Helper methods to detect fields in CSV data
  private detectDateField(row: any): string | null {
    const possibleDateFields = [
      "date",
      "Date",
      "transaction_date",
      "TransactionDate",
    ];
    return this.findField(row, possibleDateFields);
  }

  private detectDescriptionField(row: any): string | null {
    const possibleDescFields = [
      "description",
      "Description",
      "memo",
      "Memo",
      "note",
      "Note",
    ];
    return this.findField(row, possibleDescFields);
  }

  private detectAmountField(row: any): string | null {
    const possibleAmountFields = [
      "amount",
      "Amount",
      "sum",
      "Sum",
      "total",
      "Total",
    ];
    return this.findField(row, possibleAmountFields);
  }

  private detectCategoryField(row: any): string | null {
    const possibleCategoryFields = ["category", "Category", "type", "Type"];
    return this.findField(row, possibleCategoryFields);
  }

  private findField(row: any, possibleFields: string[]): string | null {
    for (const field of possibleFields) {
      if (row[field] !== undefined) {
        return field;
      }
    }
    return null;
  }

  private formatDate(dateStr: string): string {
    // Handle various date formats and convert to YYYY-MM-DD
    try {
      const date = new Date(dateStr);
      return date.toISOString().split("T")[0];
    } catch (e) {
      return dateStr; // Return as is if parsing fails
    }
  }
}
