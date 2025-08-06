import { OrdersParseCommand } from "../commands/ordersParseCommand";
import { z } from "zod";
import * as path from "path";
import * as fs from "fs/promises";
import { articlesImportCsvSchema } from "../../articles-import/schemas/articlesImportCsvSchema";
import { salesImportCsvSchema } from "../../csv-import/schemas/salesImportCsvSchema";

export class OrdersParseHandler {
  private command: OrdersParseCommand;
  constructor(command: OrdersParseCommand) {
    this.command = command;
  }

  async parse(): Promise<void> {
    const articlesArraySchema = z.array(articlesImportCsvSchema);
    const ordersRaw: string[] = await fs.readdir(this.command.ordersDirectory);

    const orders = await Promise.all(
      ordersRaw.map(async (order: string): Promise<any> => {
        const filePath = path.join(this.command.ordersDirectory, order);
        const orderContent = await fs
          .readFile(filePath, { encoding: "utf8" })
          .then((data) => JSON.parse(data))
          .then((data) => {
            try {
              return salesImportCsvSchema.parse(data);
            } catch (e) {
              console.error("Error parsing order content:", e, data);
            }
          });

        const articlesFilePath = path.join(
          this.command.articlesDirectory,
          order,
        );
        const articlesContent = await fs
          .readFile(articlesFilePath, {
            encoding: "utf8",
          })
          .then((articles) => JSON.parse(articles))
          .then((data) => {
            try {
              return articlesArraySchema.parse(data);
            } catch (e) {
              console.error("Error parsing articles content:", e, data);
            }
          });
        return { ...orderContent, articles: articlesContent };
      }),
    );

    // console.log("Orders:", orders);
  }
}
