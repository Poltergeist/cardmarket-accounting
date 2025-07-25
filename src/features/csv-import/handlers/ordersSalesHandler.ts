import { CsvParser } from "../../../infrastructure/csv/csvParser";
import { ImportSalesCommand } from "../commands/importSalesCommand";
import { salesImportCsvSchema } from "../schemas/salesImportCsvSchema";
import fs from "fs";
import path from "path";

export class OrdersImportHandler {
  private csvParser: CsvParser;
  private command: ImportSalesCommand;

  constructor(command: ImportSalesCommand) {
    this.csvParser = new CsvParser();
    this.command = command;
  }

  async import(): Promise<void> {
    try {
      const csvData = await this.csvParser.parse(this.command.filePath, ";");
      // Now write for each sale in csvData a file in the output directory
      await Promise.all(
        csvData.map(async (sale) => {
          try {
            await fs.promises.writeFile(
              path.join(this.command.outputDirectory, `${sale.OrderID}.json`),
              JSON.stringify(salesImportCsvSchema.parse(sale), null, 2),
            );
          } catch (error) {
            console.error("Error writing file:", error, sale);
          }
        }),
      );
    } catch (error) {
      console.error("Error importing CSV:", error);
      throw new Error(`Failed to import CSV: ${(error as Error).message}`);
    }
  }
}
