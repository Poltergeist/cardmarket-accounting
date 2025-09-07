import { Command } from "commander";
import { CsvImportHandler } from "./features/csv-import/handlers/csvImportHandler";
import { OrdersImportHandler } from "./features/csv-import/handlers/ordersImportHandler";
import { ArticlesImportHandler } from "./features/articles-import/handlers/handler";
import { HledgerFormatter } from "./core/services/hledgerFormatter";
import fs from "fs";
import { OrdersParseHandler } from "./features/orders-parse/handlers/handler";
import { JsonToLedgerHandler } from "./features/orders-parse/handlers/jsonToLedgerHandler";
import { ErrorHandler } from "./shared/utils/errorHandler";
import { logInfo } from "./shared/utils/logger";

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
        logInfo("Successfully created hledger file", {
          output: options.output,
        });
      } catch (error) {
        ErrorHandler.handle(error, "CSV import command");
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
        logInfo("Starting sales import", {
          file: options.file,
          output: options.output,
        });

        const handler = new OrdersImportHandler({
          filePath: options.file,
          outputDirectory: options.output,
        });

        await handler.import();

        logInfo("Successfully imported orders");
      } catch (error) {
        ErrorHandler.handle(error, "Sales import command");
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
        logInfo("Starting articles import", {
          file: options.file,
          output: options.output,
        });

        const handler = new ArticlesImportHandler({
          filePath: options.file,
          outputDirectory: options.output,
        });

        await handler.import();

        logInfo("Successfully imported articles");
      } catch (error) {
        ErrorHandler.handle(error, "Articles import command");
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

        logInfo("Successfully parsed orders");
      } catch (error) {
        ErrorHandler.handle(error, "Orders parsing command");
        process.exit(1);
      }
    });

  program
    .command("json-to-ledger")
    .description("Generate ledger file from imported JSON orders and articles")
    .option(
      "--orders-directory <path>",
      "Path to orders JSON directory",
      "data/sales",
    )
    .option(
      "--articles-directory <path>",
      "Path to articles JSON directory",
      "data/articles",
    )
    .option(
      "--output <path>",
      "Output path for the ledger journal",
      "cardmarket-ledger.journal",
    )
    .action(async (options) => {
      try {
        const handler = new JsonToLedgerHandler({
          ordersDirectory: options.ordersDirectory,
          articlesDirectory: options.articlesDirectory,
          outputPath: options.output,
        });

        await handler.generateLedger();

        logInfo("Successfully generated ledger from JSON data");
      } catch (error) {
        ErrorHandler.handle(error, "JSON to ledger command");
        process.exit(1);
      }
    });

  // Add similar commands for API and JSON importing

  await program.parseAsync();
}

main().catch((error) => {
  ErrorHandler.handle(error, "Application startup");
  process.exit(1);
});
