import { LedgerFile } from "../../../core/domain/models/ledger";
import {
  DataImporter,
  ImportOptions,
} from "../../../core/domain/interfaces/importers";
import { CsvProcessingService } from "../../../shared/services/csvProcessingService";
import { ErrorHandler } from "../../../shared/utils/errorHandler";
import { CsvToLedgerMapper } from "../mappers/csvToLedgerMapper";
import { ImportCsvCommand } from "../commands/csvImportCommand";
import { logInfo } from "../../../shared/utils/logger";

export class CsvImportHandler implements DataImporter {
  private csvProcessingService: CsvProcessingService;
  private mapper: CsvToLedgerMapper;
  private command: ImportCsvCommand;

  constructor(command: ImportCsvCommand) {
    this.csvProcessingService = new CsvProcessingService();
    this.mapper = new CsvToLedgerMapper(command.options);
    this.command = command;
  }

  async import(): Promise<LedgerFile> {
    try {
      logInfo("Starting CSV import to ledger", {
        filePath: this.command.filePath,
      });

      const csvData = await this.csvProcessingService.processFile(
        this.command.filePath,
      );
      const ledgerFile = this.mapper.mapToLedger(csvData);

      logInfo("CSV import completed successfully", {
        transactionsProcessed: ledgerFile.transactions.length,
      });

      return ledgerFile;
    } catch (error) {
      throw ErrorHandler.handle(error, "CSV import");
    }
  }
}
