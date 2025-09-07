import { LedgerFile } from "../../../core/domain/models/ledger";
import {
  DataImporter,
  ImportOptions,
} from "../../../core/domain/interfaces/importers";
import { CsvParser } from "../../../infrastructure/csv/csvParser";
import { CsvToLedgerMapper } from "../mappers/csvToLedgerMapper";
import { ImportCsvCommand } from "../commands/importCsvCommand";

export class CsvImportHandler implements DataImporter {
  private csvParser: CsvParser;
  private mapper: CsvToLedgerMapper;
  private command: ImportCsvCommand;

  constructor(command: ImportCsvCommand) {
    this.csvParser = new CsvParser();
    this.mapper = new CsvToLedgerMapper(command.options);
    this.command = command;
  }

  async import(): Promise<LedgerFile> {
    try {
      const csvData = await this.csvParser.parse(this.command.filePath);
      return this.mapper.mapToLedger(csvData);
    } catch (error) {
      console.error("Error importing CSV:", error);
      throw new Error(`Failed to import CSV: ${(error as Error).message}`);
    }
  }
}
