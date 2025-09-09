import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

describe("CLI Integration Tests", () => {
  const cliPath = path.join(__dirname, "..", "src", "index.ts");
  const tsxPath = path.join(__dirname, "..", "node_modules", ".bin", "tsx");

  it("should show help when called with --help", async () => {
    const { stdout, stderr } = await execAsync(`${tsxPath} ${cliPath} --help`);

    expect(stdout).toContain(
      "Generate hledger files from various data sources",
    );
    expect(stdout).toContain("Commands:");
    expect(stdout).toContain("import-csv");
    expect(stdout).toContain("import-sales");
    expect(stdout).toContain("import-articles");
    expect(stdout).toContain("parse-orders");
    expect(stdout).toContain("json-to-ledger");
    expect(stderr).toBe("");
  }, 10000);

  it("should show version when called with --version", async () => {
    const { stdout, stderr } = await execAsync(
      `${tsxPath} ${cliPath} --version`,
    );

    expect(stdout).toContain("1.0.0");
    expect(stderr).toBe("");
  }, 10000);

  it("should show specific command help", async () => {
    const { stdout, stderr } = await execAsync(
      `${tsxPath} ${cliPath} import-csv --help`,
    );

    expect(stdout).toContain("Import data from a CSV file");
    expect(stdout).toContain("-f, --file");
    expect(stdout).toContain("-o, --output");
    expect(stdout).toContain("-c, --currency");
    expect(stderr).toBe("");
  }, 10000);

  it("should show error when import-csv called without required file option", async () => {
    try {
      await execAsync(`${tsxPath} ${cliPath} import-csv`);
    } catch (error: any) {
      expect(error.code).toBe(1);
      expect(error.stderr).toContain(
        "required option '-f, --file <path>' not specified",
      );
    }
  }, 10000);

  it("should show json-to-ledger command help", async () => {
    const { stdout, stderr } = await execAsync(
      `${tsxPath} ${cliPath} json-to-ledger --help`,
    );

    expect(stdout).toContain(
      "Generate ledger file from imported JSON orders and articles",
    );
    expect(stdout).toContain("--orders-directory");
    expect(stdout).toContain("--articles-directory");
    expect(stdout).toContain("--output");
    expect(stderr).toBe("");
  }, 10000);
});
