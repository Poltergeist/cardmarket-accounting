import { CsvParser } from "../utils/csvParser";
import { ErrorHandler } from "../utils/errorHandler";
import { logInfo } from "../utils/logger";

export class CsvProcessingService {
  private csvParser: CsvParser;

  constructor() {
    this.csvParser = new CsvParser();
  }

  async processFile(filePath: string, delimiter: string = ","): Promise<any[]> {
    try {
      logInfo("Processing CSV file", { filePath });
      return await this.csvParser.parse(filePath, delimiter);
    } catch (error) {
      throw ErrorHandler.handle(error, "CSV file processing");
    }
  }

  async processAndValidate<T>(
    filePath: string,
    delimiter: string = ",",
    validator: (item: any) => T,
  ): Promise<T[]> {
    try {
      const csvData = await this.processFile(filePath, delimiter);
      const validatedData: T[] = [];

      for (const item of csvData) {
        try {
          const validatedItem = validator(item);
          validatedData.push(validatedItem);
        } catch (error) {
          ErrorHandler.warn("Skipping invalid row", "CSV validation", {
            item,
            error,
          });
        }
      }

      logInfo("Validated CSV data", {
        validatedRows: validatedData.length,
        totalRows: csvData.length,
      });
      return validatedData;
    } catch (error) {
      throw ErrorHandler.handle(error, "CSV processing and validation");
    }
  }
}
