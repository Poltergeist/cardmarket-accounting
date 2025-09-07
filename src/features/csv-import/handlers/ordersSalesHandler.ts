import { CsvProcessingService } from "../../../shared/services/csvProcessingService";
import { FileWriterService } from "../../../shared/services/fileWriterService";
import { ErrorHandler } from "../../../shared/utils/errorHandler";
import { ImportSalesCommand } from "../commands/importSalesCommand";
import { salesImportCsvSchema } from "../schemas/salesImportCsvSchema";
import { logInfo } from "../../../shared/utils/logger";

export class OrdersImportHandler {
  private csvProcessingService: CsvProcessingService;
  private fileWriterService: FileWriterService;
  private command: ImportSalesCommand;

  constructor(command: ImportSalesCommand) {
    this.csvProcessingService = new CsvProcessingService();
    this.fileWriterService = new FileWriterService();
    this.command = command;
  }

  async import(): Promise<void> {
    try {
      logInfo("Starting sales orders import", {
        filePath: this.command.filePath,
      });

      const validatedSales = await this.csvProcessingService.processAndValidate(
        this.command.filePath,
        ";",
        (item) => salesImportCsvSchema.parse(item),
      );

      // Create file map using OrderID
      const fileMap: Record<string, any> = {};
      for (const sale of validatedSales) {
        fileMap[sale.OrderID] = sale;
      }

      await this.fileWriterService.writeMultipleJson(
        fileMap,
        this.command.outputDirectory,
      );

      logInfo("Sales orders import completed successfully", {
        ordersProcessed: validatedSales.length,
      });
    } catch (error) {
      throw ErrorHandler.handle(error, "Sales orders import");
    }
  }
}
