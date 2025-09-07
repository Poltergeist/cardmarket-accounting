# Cardmarket Accounting

A TypeScript CLI tool and library to help you turn your Cardmarket data exports (e.g., CSVs) into accounting-ready information. It focuses on parsing sales/purchases, validating rows, and preparing data for downstream bookkeeping or analysis workflows.

Status: Early WIP. Expect breaking changes as features stabilize.

## Features

- Command-line interface built with Commander
- CSV ingestion using streaming parsers for large files
- Strong typing and validation (TypeScript + Zod) for safer data handling
- Modular architecture (core, features, infrastructure) for future extension
- Run TypeScript directly with `tsx` or compile to JavaScript with `tsc`
- No external services or credentials required for basic CSV workflows

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm 10+ (repository uses `packageManager: pnpm@10.x`)

Alternative package managers (npm/yarn) should work, but examples below use pnpm.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Poltergeist/cardmarket-accounting.git
   cd cardmarket-accounting
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

## Usage

You can either run the tool directly with `tsx` (no build step), or compile first and run the compiled JavaScript from `dist/`.

### Show CLI help

If the CLI exposes flags/options, you’ll typically see them via:

```bash
pnpm exec tsx src/index.ts --help
```

### Run directly (no build step)

```bash
# Example: process a CSV export
pnpm exec tsx src/index.ts path/to/cardmarket-export.csv

# You can pass additional options if implemented
pnpm exec tsx src/index.ts path/to/cardmarket-export.csv --out ./out --format json
```

### Build and run

```bash
# Type-check and emit to dist/
pnpm exec tsc -p tsconfig.json

# Run the compiled entrypoint
node dist/index.js path/to/cardmarket-export.csv
```

Notes:

- The repository currently doesn’t define npm scripts (e.g., `build`, `dev`). Use the `pnpm exec` commands above or add scripts to `package.json` as desired.
- Example flags (`--out`, `--format`) are illustrative. Use `--help` to discover the actual, current CLI surface.

## Configuration

- Environment variables: None required for basic usage.
- Configuration file: Not required. Options are expected to be provided via CLI flags.
- CSV input: Use the Cardmarket export CSV you want to process (e.g., orders, sold items). Make sure the CSV has headers expected by the CLI.

If you introduce new configuration, consider a `.env` file (with a library like `dotenv`) or a `config.json` and document the schema explicitly.

## Project Structure

```
cardmarket-accounting/
├─ .gitignore
├─ package.json
├─ pnpm-lock.yaml
├─ tsconfig.json
└─ src/
   ├─ index.ts          # CLI entrypoint
   ├─ test.ts           # ad-hoc testing/scratchpad
   ├─ core/             # domain entities, business rules
   ├─ features/         # feature-level orchestration
   └─ infrastructure/   # adapters, IO, CSV glue, etc.
```

TypeScript is configured to:

- Target ES2021
- Emit to `dist/`
- Use strict type-checking
- Exclude `dist/` and `node_modules/`

## Development

- Format with Prettier:

  ```bash
  pnpm exec prettier --write .
  ```

- Type-check:

  ```bash
  pnpm exec tsc --noEmit
  ```

- Build:
  ```bash
  pnpm exec tsc -p tsconfig.json
  ```

## Testing

There are currently no automated tests defined (the default `test` script exits with an error). If you plan to add tests, consider:

- Vitest or Jest for unit tests
- A sample fixture CSV in a `tests/` or `__tests__/` folder
- End-to-end tests invoking the CLI on fixture data

Example (after adding Vitest):

```bash
pnpm dlx vitest init
pnpm test
```

## Contributing

Contributions are welcome!

1. Fork the repo and create your branch from `main`:
   ```bash
   git checkout -b feat/your-feature
   ```
2. Install dependencies and ensure type-checks pass:
   ```bash
   pnpm install
   pnpm exec tsc --noEmit
   ```
3. Format your changes:
   ```bash
   pnpm exec prettier --write .
   ```
4. Commit with clear messages and open a pull request.

Suggestions that add automated tests and basic CI are especially appreciated.

## License

ISC. See the `license` field in `package.json`. If you need a dedicated `LICENSE` file, open an issue or submit a PR adding the ISC license text.

## Contact and Support

- Issues: https://github.com/Poltergeist/cardmarket-accounting/issues
- Maintainer: [Poltergeist](https://github.com/Poltergeist)

Please open a GitHub issue for bug reports, questions, or feature requests.
