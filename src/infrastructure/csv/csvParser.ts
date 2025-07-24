import fs from "fs";
import { parse as csvParse } from "csv-parse";

export class CsvParser {
  async parse(filePath: string, delimiter: string = ","): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];

      const parser = csvParse({
        columns: true, // optional: converts rows to objects using headers
        delimiter,
        skip_empty_lines: true,
      });

      fs.createReadStream(filePath)
        .pipe(parser)
        .on("data", (data) => results.push(data))
        .on("end", () => resolve(results))
        .on("error", (error) => reject(error));
    });
  }
}

