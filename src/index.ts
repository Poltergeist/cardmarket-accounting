import { Command } from "commander";
import { CsvImportHandler } from "./features/csv-import/handlers/csvImportHandler";
import { OrdersImportHandler } from "./features/csv-import/handlers/ordersSalesHandler";
import { HledgerFormatter } from "./core/services/hledgerFormatter";
import fs from "fs";

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

  // Add similar commands for API and JSON importing

  await program.parseAsync();
}

main().catch(console.error);
