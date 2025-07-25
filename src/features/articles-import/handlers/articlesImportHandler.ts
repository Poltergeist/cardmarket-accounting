import { CsvParser } from "../../../infrastructure/csv/csvParser";
import { ArticlesImportCommand } from "../commands/articlesImportCommand";
import { articlesImportCsvSchema } from "../schemas/articlesImportCsvSchema";
import fs from "fs";
import path from "path";

export class ArticlesImportHandler {
  private csvParser: CsvParser; // Replace with actual CsvParser type
  private command: ArticlesImportCommand; // Replace with actual articlesImportCommand type

  constructor(command: ArticlesImportCommand) {
    this.csvParser = new CsvParser();
    this.command = command;
  }

  async import(): Promise<void> {
    try {
      const csvData = await this.csvParser.parse(this.command.filePath, ";");
      // Now write for each sale in csvData a file in the output directory
      const grouped = csvData.reduce((acc, item) => {
        const key = item["Shipment nr."];
        if (!acc[key]) {
          acc[key] = [];
        }
        try {
          acc[key] = [...acc[key], articlesImportCsvSchema.parse(item)];
        } catch (error) {
          console.error("Error parsing item:", error, item);
        }
        return acc;
      }, {});

      for (const [id, group] of Object.entries(grouped)) {
        try {
          await fs.promises.writeFile(
            path.join(this.command.outputDirectory, `${id}.json`),
            JSON.stringify(group, null, 2),
          );
        } catch (error) {
          console.error("Error writing file:", error);
        }
      }
    } catch (error) {
      console.error("Error writing File:", error);
    }
  }
}
