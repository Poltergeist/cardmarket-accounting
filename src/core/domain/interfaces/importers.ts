import { LedgerFile } from "../models/ledger";

export interface DataImporter {
  import(): Promise<LedgerFile>;
}

export interface ImportOptions {
  sourcePath?: string;
  sourceUrl?: string;
  apiKey?: string;
  accountMappings?: Record<string, string>;
  defaultCurrency?: string;
}
