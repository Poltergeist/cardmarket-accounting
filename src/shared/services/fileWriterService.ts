import fs from "fs";
import path from "path";
import { ErrorHandler } from "../utils/errorHandler";
import { logInfo } from "../utils/logger";

export class FileWriterService {
  async writeJson(data: any, filePath: string): Promise<void> {
    try {
      // Ensure directory exists
      await this.ensureDirectoryExists(path.dirname(filePath));

      logInfo("Writing JSON data", { filePath });
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
      logInfo("Successfully wrote JSON file", { filePath });
    } catch (error) {
      throw ErrorHandler.handle(error, "JSON file writing");
    }
  }

  async writeText(content: string, filePath: string): Promise<void> {
    try {
      // Ensure directory exists
      await this.ensureDirectoryExists(path.dirname(filePath));

      logInfo("Writing text content", { filePath });
      await fs.promises.writeFile(filePath, content);
      logInfo("Successfully wrote text file", { filePath });
    } catch (error) {
      throw ErrorHandler.handle(error, "Text file writing");
    }
  }

  async writeMultipleJson(
    dataMap: Record<string, any>,
    outputDirectory: string,
  ): Promise<void> {
    try {
      await this.ensureDirectoryExists(outputDirectory);

      const writePromises = Object.entries(dataMap).map(([filename, data]) => {
        const filePath = path.join(outputDirectory, `${filename}.json`);
        return this.writeJson(data, filePath);
      });

      await Promise.all(writePromises);
      logInfo("Successfully wrote multiple JSON files", {
        fileCount: Object.keys(dataMap).length,
        outputDirectory,
      });
    } catch (error) {
      throw ErrorHandler.handle(error, "Multiple JSON file writing");
    }
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.promises.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw ErrorHandler.handle(error, "Directory creation");
    }
  }
}
