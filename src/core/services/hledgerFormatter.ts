import { LedgerFile, Transaction } from '../domain/models/ledger';
import { promises as fs } from 'fs';

export class HledgerFormatter {
  constructor(private ledgerFile: LedgerFile) {}

  async writeToFile(filePath: string): Promise<void> {
    const content = this.ledgerFile.toString();
    await fs.writeFile(filePath, content);
  }

  validateTransaction(transaction: Transaction): boolean {
    // Basic validation rules for hledger
    if (!transaction.date || !transaction.description || !transaction.postings || transaction.postings.length < 2) {
      return false;
    }

    // Check date format (YYYY-MM-DD or YYYY/MM/DD)
    const dateRegex = /^(\d{4})[/-](\d{2})[/-](\d{2})$/;
    if (!dateRegex.test(transaction.date)) {
      return false;
    }

    return true;
  }
}