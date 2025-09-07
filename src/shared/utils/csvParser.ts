import fs from "fs";
import { parse as csvParse } from "csv-parse";
import { ErrorHandler } from "./errorHandler";
import { logInfo } from "./logger";

export class CsvParser {
  async parse(filePath: string, delimiter: string = ","): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];

      logInfo("Parsing CSV file", { filePath, delimiter });

      const parser = csvParse({
        columns: true, // optional: converts rows to objects using headers
        delimiter,
        skip_empty_lines: true,
      });

      const readStream = fs.createReadStream(filePath);

      readStream.on("error", (error) => {
        const processedError = ErrorHandler.handle(error, "CSV file reading");
        reject(processedError);
      });

      readStream
        .pipe(parser)
        .on("data", (data) => results.push(data))
        .on("end", () => {
          logInfo("Successfully parsed CSV", { rowCount: results.length });
          resolve(results);
        })
        .on("error", (error) => {
          const processedError = ErrorHandler.handle(error, "CSV parsing");
          reject(processedError);
        });
    });
  }
}
