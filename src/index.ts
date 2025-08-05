import { Command } from "commander";
import { CsvImportHandler } from "./features/csv-import/handlers/csvImportHandler";
import { OrdersImportHandler } from "./features/csv-import/handlers/ordersSalesHandler";
import { ArticlesImportHandler } from "./features/articles-import/handlers/articlesImportHandler";
import { HledgerFormatter } from "./core/services/hledgerFormatter";
import fs from "fs";
import { OrdersParseHandler } from "./features/orders-parse/handlers/ordersParseHandler";

async function main() {
  const program = new Command();

  program
    .name("hledger-generator")
    .description("Generate hledger files from various data sources")
    .version("1.0.0");

  program
    .command("import-csv")
    .description("Import data from a CSV file")
    .requiredOption("-f, --file <path>", "Path to CSV file")
    .option("-o, --output <path>", "Output hledger file", "ledger.journal")
    .option("-c, --currency <currency>", "Default currency", "USD")
    .option("-m, --mappings <path>", "Path to account mappings JSON file")
    .action(async (options) => {
      try {
        console.log("Importing from CSV:", options.file);

        // Load account mappings if provided
        let accountMappings = {};
        if (options.mappings) {
          const mappingsContent = await fs.promises.readFile(
            options.mappings,
            "utf8",
          );
          accountMappings = JSON.parse(mappingsContent);
        }

        const importOptions = {
          defaultCurrency: options.currency,
          accountMappings,
        };

        const handler = new CsvImportHandler({
          filePath: options.file,
          options: importOptions,
        });

        const ledgerFile = await handler.import();
        const formatter = new HledgerFormatter(ledgerFile);

        await formatter.writeToFile(options.output);
        console.log(`Successfully created hledger file: ${options.output}`);
      } catch (error) {
        console.error("Error:", error);
        process.exit(1);
      }
    });

  program
    .command("import-sales")
    .description("Import sales data from a CSV file")
    .requiredOption("-f, --file <path>", "Path to CSV file")
    .option("-o, --output <path>", "Output directory", "data/sales/")
    .action(async (options) => {
      try {
        console.log("Importing from CSV:", options.file);

        const handler = new OrdersImportHandler({
          filePath: options.file,
          outputDirectory: options.output,
        });

        await handler.import();

        console.log(`Successfully imported orders`);
      } catch (error) {
        console.error("Error:", error);
        process.exit(1);
      }
    });

  program
    .command("import-articles")
    .description("Import articles data from a CSV file")
    .requiredOption("-f, --file <path>", "Path to CSV file")
    .option("-o, --output <path>", "Output directory", "data/articles/")
    .action(async (options) => {
      try {
        console.log("Importing from CSV:", options.file);

        const handler = new ArticlesImportHandler({
          filePath: options.file,
          outputDirectory: options.output,
        });

        await handler.import();

        console.log(`Successfully imported orders`);
      } catch (error) {
        console.error("Error:", error);
        process.exit(1);
      }
    });

  program
    .command("parse-orders")
    .description("Parse Orders which have been imported")
    .option("-o, --orders-directory <path>", "Path to CSV file", "data/sales")
    .option(
      "-a, --articles-directory <path>",
      "Path to CSV file",
      "data/articles",
    )
    .action(async (options) => {
      try {
        const handler = new OrdersParseHandler({
          ordersDirectory: options.ordersDirectory,
          articlesDirectory: options.articlesDirectory,
        });

        await handler.parse();

        console.log(`Successfully parsed orders`);
      } catch (error) {
        console.error("Error:", error);
        process.exit(1);
      }
    });

  // Add similar commands for API and JSON importing

  await program.parseAsync();
}

main().catch(console.error);
