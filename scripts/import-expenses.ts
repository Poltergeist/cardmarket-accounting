#!/usr/bin/env tsx

import { Command } from "commander";
import { CsvProcessingService } from "../src/shared/services/csvProcessingService";
import {
  LedgerFile,
  Transaction,
  Posting,
} from "../src/core/domain/models/ledger";
import { HledgerFormatter } from "../src/core/services/hledgerFormatter";
import { ErrorHandler } from "../src/shared/utils/errorHandler";
import { logInfo, logError } from "../src/shared/utils/logger";
import { promises as fs } from "fs";

interface ExpenseRow {
  Timestamp: string;
  Name: string;
  Code: string;
  Amount: string;
  Datum: string;
  Kommentar: string;
}

interface ExpenseRecord {
  timestamp: string;
  name: string;
  code: string;
  amount: number;
  date: string;
  comment: string;
}

class ExpenseMapper {
  private mapExpenseAccount(code: string): string {
    switch (code) {
      case "900":
        return "Expenses:Cardmarket:Shipping:stamps";
      case "901":
        return "Expenses:Cardmarket:Shipping:Stationary";
      case "902":
        return "Expenses:Cardmarket:TCGPowerTools";
      default:
        return `Expenses:Cardmarket:Product:${code}`;
    }
  }

  private mapBalancingAccount(code: string): string {
    switch (code) {
      case "900":
      case "901":
        return "Assets:Cardmarket:Receivable:Shipping";
      case "902":
        return "Assets:Cardmarket:Receivable:Operations";
      default:
        return `Assets:Cardmarket:Receivable:${code}`;
    }
  }

  private parseDateFromDatum(datum: string): string {
    // Handle M/D/YYYY format and convert to YYYY-MM-DD
    try {
      const date = new Date(datum);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${datum}`);
      }
      return date.toISOString().split("T")[0];
    } catch (error) {
      ErrorHandler.warn(
        "Failed to parse date, using current date",
        "Date parsing",
        {
          datum,
          error,
        },
      );
      return new Date().toISOString().split("T")[0];
    }
  }

  private validateAndParseRow(row: any): ExpenseRecord | null {
    try {
      // Check for required fields
      if (!row.Code || !row.Amount || !row.Datum) {
        ErrorHandler.warn(
          "Skipping row: missing required fields",
          "Expense validation",
          {
            row,
          },
        );
        return null;
      }

      const amount = parseFloat(
        row.Amount.toString().replace(/[^0-9.-]+/g, ""),
      );
      if (isNaN(amount)) {
        ErrorHandler.warn(
          "Skipping row: invalid amount",
          "Expense validation",
          {
            row,
          },
        );
        return null;
      }

      return {
        timestamp: row.Timestamp || "",
        name: row.Name || "Unknown",
        code: row.Code.toString(),
        amount,
        date: this.parseDateFromDatum(row.Datum),
        comment: row.Kommentar || "",
      };
    } catch (error) {
      ErrorHandler.warn("Failed to validate row", "Expense validation", {
        row,
        error,
      });
      return null;
    }
  }

  mapToTransaction(record: ExpenseRecord): Transaction {
    const expenseAccount = this.mapExpenseAccount(record.code);
    const balancingAccount = this.mapBalancingAccount(record.code);

    const postings: Posting[] = [
      {
        account: expenseAccount,
        amount: record.amount,
        currency: "EUR",
      },
      {
        account: balancingAccount,
        amount: -record.amount,
        currency: "EUR",
      },
    ];

    const commentLine = `Code: ${record.code} | Timestamp: ${record.timestamp}`;

    return {
      date: record.date,
      description: record.name,
      postings,
      tags: {
        comment: commentLine,
      },
    };
  }

  mapCsvToLedger(csvData: any[]): LedgerFile {
    const ledgerFile = new LedgerFile();

    for (const row of csvData) {
      const record = this.validateAndParseRow(row);
      if (record) {
        const transaction = this.mapToTransaction(record);
        ledgerFile.addTransaction(transaction);
      }
    }

    return ledgerFile;
  }
}

async function main() {
  const program = new Command();

  program
    .name("import-expenses")
    .description("Import external expenses CSV to hledger transactions")
    .version("1.0.0");

  program
    .requiredOption("--csv <path>", "Path to expenses CSV file")
    .option("--out <path>", "Output file path (default: stdout)")
    .option("--dry-run", "Parse and report without writing output")
    .action(async (options) => {
      try {
        logInfo("Starting expense import", {
          csvPath: options.csv,
          outputPath: options.out,
          dryRun: options.dryRun,
        });

        // Parse CSV
        const csvService = new CsvProcessingService();
        const csvData = await csvService.processFile(options.csv);

        logInfo(`Parsed ${csvData.length} rows from CSV`);

        // Map to ledger
        const mapper = new ExpenseMapper();
        const ledgerFile = mapper.mapCsvToLedger(csvData);

        logInfo(`Created ${ledgerFile.transactions.length} transactions`);

        if (options.dryRun) {
          logInfo("Dry run complete - no output written");
          console.log("\nSample transactions:");
          console.log(
            ledgerFile.toString().split("\n\n").slice(0, 2).join("\n\n"),
          );
          return;
        }

        // Output results
        const output = ledgerFile.toString();
        if (options.out) {
          await fs.writeFile(options.out, output);
          logInfo(`Written to ${options.out}`);
        } else {
          console.log(output);
        }
      } catch (error) {
        ErrorHandler.handle(error, "Expense import");
        process.exit(1);
      }
    });

  await program.parseAsync();
}

// Simple check for script execution - avoids import.meta.url which requires ES2020+ modules
const isMainScript =
  process.argv[1] && process.argv[1].includes("import-expenses.ts");

if (isMainScript) {
  main().catch((error) => {
    ErrorHandler.handle(error, "Expense import script");
    process.exit(1);
  });
}

export { ExpenseMapper };
