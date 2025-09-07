import { CsvProcessingService } from "../../../shared/services/csvProcessingService";
import { FileWriterService } from "../../../shared/services/fileWriterService";
import { ErrorHandler } from "../../../shared/utils/errorHandler";
import { ArticlesImportCommand } from "../commands/command";
import { articlesImportCsvSchema } from "../schemas/schema";
import { logInfo } from "../../../shared/utils/logger";

export class ArticlesImportHandler {
  private csvProcessingService: CsvProcessingService;
  private fileWriterService: FileWriterService;
  private command: ArticlesImportCommand;

  constructor(command: ArticlesImportCommand) {
    this.csvProcessingService = new CsvProcessingService();
    this.fileWriterService = new FileWriterService();
    this.command = command;
  }

  async import(): Promise<void> {
    try {
      logInfo("Starting articles import", { filePath: this.command.filePath });

      const csvData = await this.csvProcessingService.processFile(
        this.command.filePath,
        ";",
      );

      // Group articles by shipment number
      const grouped = this.groupByShipment(csvData);

      // Write each shipment group to a separate file
      await this.fileWriterService.writeMultipleJson(
        grouped,
        this.command.outputDirectory,
      );

      logInfo("Articles import completed successfully", {
        shipmentsProcessed: Object.keys(grouped).length,
      });
    } catch (error) {
      throw ErrorHandler.handle(error, "Articles import");
    }
  }

  private groupByShipment(csvData: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};

    for (const item of csvData) {
      const key = item["Shipment nr."];
      if (!key) {
        ErrorHandler.warn(
          "Skipping item without shipment number",
          "Articles import",
          { item },
        );
        continue;
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }

      try {
        const validatedItem = articlesImportCsvSchema.parse(item);
        grouped[key].push(validatedItem);
      } catch (error) {
        ErrorHandler.warn("Skipping invalid item", "Articles import", {
          item,
          error,
        });
      }
    }

    return grouped;
  }
}
