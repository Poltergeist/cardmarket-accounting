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
  pnpm run format
  ```

- Check formatting:

  ```bash
  pnpm run format:check
  ```

- Run linter:

  ```bash
  pnpm run lint
  ```

- Fix linting issues:

  ```bash
  pnpm run lint:fix
  ```

- Type-check:

  ```bash
  pnpm run type-check
  ```

- Build:
  ```bash
  pnpm run build
  ```

## Testing

The project uses Jest for testing with TypeScript support. Tests are located in the `tests/` directory.

Available test commands:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage report
pnpm run test:coverage
```

### Test Structure

- **Unit tests**: Core domain models and services (`tests/ledger.test.ts`, `tests/hledgerFormatter.test.ts`)
- **Integration tests**: CLI functionality (`tests/cli.test.ts`)

Example test file structure:

```
tests/
├── ledger.test.ts           # Tests for LedgerFile and Transaction models
├── hledgerFormatter.test.ts # Tests for HledgerFormatter service
└── cli.test.ts             # CLI integration tests
```

## Continuous Integration

The project uses GitHub Actions for automated CI/CD. The workflow runs on every push and pull request to the `main` branch.

### CI Pipeline

The CI pipeline performs the following checks:

1. **Type checking** - Ensures TypeScript compiles without errors
2. **Code formatting** - Verifies code is properly formatted with Prettier
3. **Linting** - Runs ESLint to catch code quality issues
4. **Building** - Compiles TypeScript to JavaScript
5. **Testing** - Runs the full test suite with coverage reporting
6. **Commit message validation** - Enforces [Conventional Commits](https://www.conventionalcommits.org/) format

The pipeline runs on both Node.js 18.x and 20.x to ensure compatibility.

### Automated Releases

The project uses [release-please](https://github.com/googleapis/release-please) for automated releases based on [Conventional Commits](https://www.conventionalcommits.org/):

- **Semantic versioning**: Automatic version bumps based on commit types
- **Changelog generation**: Automatically generated from commit messages
- **Release automation**: Creates releases when changes are merged to main

[![Release](https://github.com/Poltergeist/cardmarket-accounting/actions/workflows/release.yml/badge.svg)](https://github.com/Poltergeist/cardmarket-accounting/actions/workflows/release.yml)

### Coverage Reporting

Test coverage reports are automatically generated and can be uploaded to Codecov. Coverage reports include:

- Statement coverage
- Branch coverage
- Function coverage
- Line coverage

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for detailed information about our development process, commit message format, and coding standards.

### Quick Start

1. Fork the repo and create your branch from `main`:
   ```bash
   git checkout -b feat/your-feature
   ```
2. Install dependencies and run the full validation suite:
   ```bash
   pnpm install
   pnpm run type-check
   pnpm run lint
   pnpm run format:check
   pnpm test
   ```
3. Format your changes:
   ```bash
   pnpm run format
   ```
4. **Important**: Use [Conventional Commits](https://www.conventionalcommits.org/) format:
   ```bash
   git commit -m "feat: add your feature description"
   ```
5. Open a pull request.

### Commit Message Format

This project enforces [Conventional Commits](https://www.conventionalcommits.org/). Examples:

- `feat: add new CSV import functionality`
- `fix: resolve parsing error with empty files`
- `docs: update installation instructions`

See our [Contributing Guide](./CONTRIBUTING.md) for complete details and examples.

## License

ISC. See the `license` field in `package.json`. If you need a dedicated `LICENSE` file, open an issue or submit a PR adding the ISC license text.

## Contact and Support

- Issues: https://github.com/Poltergeist/cardmarket-accounting/issues
- Maintainer: [Poltergeist](https://github.com/Poltergeist)

Please open a GitHub issue for bug reports, questions, or feature requests.
