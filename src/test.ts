import { LedgerFile, Transaction, Posting } from "./core/domain/models/ledger";
// import { ImportOptions } from "./core/domain/interfaces/importers";

const ledgerFile = new LedgerFile();

const transaction: Transaction = {
  date: "2023-10-01",
  description: "Sample Transaction",
  postings: [
    {
      account: "Assets:Checking",
      currency: "USD",
    },
    {
      account: "Expenses:Cards",
      amount: 150.0,
      currency: "USD",
    },
    {
      account: "Expenses:Food",
      amount: 100.0,
      currency: "USD",
    },
  ],
};

ledgerFile.addTransaction(transaction);

console.log(ledgerFile.toString());
// export class CsvToLedgerMapper {
//   private options: ImportOptions;
//
//   constructor(options: ImportOptions) {
//     this.options = options;
//   }
//
//   mapToLedger(csvData: any[]): LedgerFile {
//
//     for (const row of csvData) {
//       const transaction = this.createTransaction(row);
//       if (transaction) {
//         ledgerFile.addTransaction(transaction);
//       }
//     }
//
//     return ledgerFile;
//   }
