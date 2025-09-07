import { JsonToLedgerCommand } from "../commands/jsonToLedgerCommand";
import { z } from "zod";
import * as path from "path";
import * as fs from "fs/promises";
import { articlesImportCsvSchema } from "../../articles-import/schemas/schema";
import { salesImportCsvSchema } from "../../csv-import/schemas/schema";
import { ErrorHandler } from "../../../shared/utils/errorHandler";
import { logInfo } from "../../../shared/utils/logger";
import { JsonOrdersToLedgerMapper } from "../mappers/jsonOrdersToLedgerMapper";
import { HledgerFormatter } from "../../../core/services/hledgerFormatter";

export class JsonToLedgerHandler {
  private command: JsonToLedgerCommand;

  constructor(command: JsonToLedgerCommand) {
    this.command = command;
  }

  async generateLedger(): Promise<void> {
    try {
      logInfo("Starting JSON to ledger generation", {
        ordersDirectory: this.command.ordersDirectory,
        articlesDirectory: this.command.articlesDirectory,
        outputPath: this.command.outputPath,
      });

      const articlesArraySchema = z.array(articlesImportCsvSchema);
      const ordersRaw: string[] = await fs.readdir(
        this.command.ordersDirectory,
      );

      const orders = await Promise.all(
        ordersRaw.map(async (order: string): Promise<any> => {
          try {
            const orderContent = await this.loadAndValidateOrder(order);
            const articlesContent = await this.loadAndValidateArticles(
              order,
              articlesArraySchema,
            );

            return { ...orderContent, articles: articlesContent };
          } catch (error) {
            ErrorHandler.warn(
              `Failed to process order: ${order}`,
              "JSON to ledger generation",
              { error },
            );
            return null;
          }
        }),
      );

      const validOrders = orders.filter((order) => order !== null);

      logInfo("Loaded and validated orders", {
        totalOrders: ordersRaw.length,
        validOrders: validOrders.length,
      });

      // Map to ledger transactions
      const mapper = new JsonOrdersToLedgerMapper();
      const ledgerFile = mapper.mapToLedger(validOrders);

      // Write to output file
      const formatter = new HledgerFormatter(ledgerFile);
      await formatter.writeToFile(this.command.outputPath);

      logInfo("Successfully generated ledger file", {
        output: this.command.outputPath,
        transactionCount: ledgerFile.transactions.length,
      });
    } catch (error) {
      throw ErrorHandler.handle(error, "JSON to ledger generation");
    }
  }

  private async loadAndValidateOrder(orderFileName: string): Promise<any> {
    const filePath = path.join(this.command.ordersDirectory, orderFileName);
    const orderContent = await fs
      .readFile(filePath, { encoding: "utf8" })
      .then((data) => JSON.parse(data));

    try {
      return salesImportCsvSchema.parse(orderContent);
    } catch (e) {
      ErrorHandler.warn("Invalid order content", "Order validation", {
        file: orderFileName,
        error: e,
        data: orderContent,
      });
      throw e;
    }
  }

  private async loadAndValidateArticles(
    orderFileName: string,
    articlesArraySchema: z.ZodType,
  ): Promise<any> {
    const articlesFilePath = path.join(
      this.command.articlesDirectory,
      orderFileName,
    );

    const articlesContent = await fs
      .readFile(articlesFilePath, { encoding: "utf8" })
      .then((articles) => JSON.parse(articles));

    try {
      return articlesArraySchema.parse(articlesContent);
    } catch (e) {
      ErrorHandler.warn("Invalid articles content", "Articles validation", {
        file: orderFileName,
        error: e,
        data: articlesContent,
      });
      throw e;
    }
  }
}
