import { OrdersParseCommand } from "../commands/ordersParseCommand";
import * as path from "path";
import * as fs from "fs/promises";

export class OrdersParseHandler {
  private command: OrdersParseCommand;
  constructor(command: OrdersParseCommand) {
    this.command = command;
  }

  async parse(): Promise<void> {
    console.log(this.command.ordersDirectory);

    const ordersRaw: string[] = await fs.readdir(this.command.ordersDirectory);

    const orders = await Promise.all(
      ordersRaw.map(async (order: string): Promise<string> => {
        const filePath = path.join(this.command.ordersDirectory, order);
        const orderContent = await fs
          .readFile(filePath, { encoding: "utf8" })
          .then((data) => JSON.parse(data));
        const articlesFilePath = path.join(
          this.command.articlesDirectory,
          order,
        );
        const articlesContent = await fs
          .readFile(articlesFilePath, {
            encoding: "utf8",
          })
          .then((articles) => JSON.parse(articles));
        return { ...orderContent, articles: articlesContent };
      }),
    );

    console.log("Orders:", orders);
  }
}
