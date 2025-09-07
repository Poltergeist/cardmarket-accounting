# Cardmarket Accounting - Copilot Instructions

## Project Overview

This is a TypeScript CLI tool that processes Cardmarket data exports (CSV files) and converts them into accounting-ready information, particularly hledger journal format. The project is in early WIP status with expected breaking changes.

**Repository Size**: ~20 TypeScript files, modular architecture
**Language**: TypeScript 5.8.3 targeting ES2021
**Runtime**: Node.js 18+
**Package Manager**: pnpm 10+ (REQUIRED - npm/yarn not recommended)
**Architecture**: Modular with core/, features/, infrastructure/ separation

## Prerequisites and Environment Setup

**CRITICAL**: This project requires pnpm 10+. The packageManager field in package.json specifies pnpm@10.11.0. While npm may work, pnpm is the recommended and tested package manager.

```bash
# Install pnpm globally first (ALWAYS required)
npm install -g pnpm@10.11.0

# Install dependencies (ALWAYS run this after clone - takes ~2 seconds)
pnpm install
```

**Note**: You may see a warning about ignored build scripts (esbuild) - this is expected and safe to ignore.

## Build and Development Commands

### Type Checking and Building

**KNOWN ISSUE**: The codebase currently has TypeScript compilation errors in `src/features/csv-import/mappers/csvToLedgerMapper.ts` (lines 40, 43, 44) related to null index types. These errors prevent clean builds.

```bash
# Type-check only (will show current errors - takes ~1.5 seconds)
pnpm exec tsc --noEmit

# Build to dist/ (currently fails due to TS errors)
pnpm exec tsc -p tsconfig.json

# Run directly without building (RECOMMENDED - starts immediately)
pnpm exec tsx src/index.ts --help
```

### Code Formatting

Prettier is configured and working:

```bash
# Format all files (ALWAYS run before committing)
pnpm exec prettier --write .
```

### Running the CLI

The CLI can be run directly with tsx without building:

```bash
# Show main help
pnpm exec tsx src/index.ts --help

# Show command-specific help
pnpm exec tsx src/index.ts import-csv --help
pnpm exec tsx src/index.ts import-sales --help
pnpm exec tsx src/index.ts import-articles --help
pnpm exec tsx src/index.ts parse-orders --help

# Example usage (requires CSV file)
pnpm exec tsx src/index.ts import-csv -f path/to/file.csv -o output.journal
```

## Testing

**IMPORTANT**: There are NO automated tests. The default `test` script in package.json exits with an error. The README suggests adding Vitest or Jest if tests are needed. There is a `src/test.ts` file used for ad-hoc testing/scratchpad purposes.

To validate changes:

1. Run `pnpm exec tsx src/index.ts --help` to ensure CLI loads
2. Test specific commands with sample CSV files
3. Use `src/test.ts` for manual testing if needed

## Project Architecture

```
src/
├─ index.ts              # CLI entrypoint (Commander setup)
├─ test.ts               # Ad-hoc testing/scratchpad
├─ core/                 # Domain entities, business rules
│  ├─ domain/
│  │  ├─ interfaces/     # Importer interfaces
│  │  └─ models/         # Ledger models
│  └─ services/          # HledgerFormatter service
├─ features/             # Feature-level orchestration
│  ├─ csv-import/        # Generic CSV import
│  ├─ articles-import/   # Articles-specific import
│  └─ orders-parse/      # Order parsing
└─ infrastructure/       # Adapters, IO, CSV glue
   └─ csv/               # CSV parsing utilities
```

### Key Files to Understand:

- **`src/index.ts`**: CLI entrypoint using Commander, defines all available commands
- **`src/core/services/hledgerFormatter.ts`**: Handles hledger file output format
- **`src/infrastructure/csv/csvParser.ts`**: CSV parsing utilities
- **`tsconfig.json`**: Comprehensive TypeScript configuration (strict mode, ES2021, emit to dist/)

## Available CLI Commands

1. **`import-csv`**: Import generic CSV data to hledger format
2. **`import-sales`**: Import sales-specific CSV data
3. **`import-articles`**: Import articles data from CSV (outputs JSON files by shipment)
4. **`parse-orders`**: Parse previously imported orders with articles data

## Configuration

- **No environment variables required** for basic usage
- **No configuration files** - options provided via CLI flags
- **CSV input**: Expects headers in CSV files (specific format depends on command)
- **Output**: Generates hledger journal files or JSON data files in specified directories

## Validation and CI/CD

**CRITICAL**: There are NO GitHub workflows, CI/CD pipelines, or automated validation. Changes must be manually validated:

1. Ensure `pnpm install` works
2. Verify `pnpm exec prettier --write .` formats correctly
3. Test CLI functionality with `pnpm exec tsx src/index.ts --help`
4. Try relevant commands with sample data

## Common Issues and Workarounds

### TypeScript Compilation Errors

The project currently has null index type errors in csvToLedgerMapper.ts. These don't prevent running with tsx but block compilation:

- **Workaround**: Use `pnpm exec tsx` to run directly
- **Fix**: Add null checks before accessing row[field] properties

### Build Artifacts

The project outputs to `dist/` directory. The .gitignore properly excludes build artifacts and the `data/` directory where output files are stored.

### Package Manager

**ALWAYS use pnpm**. The project is configured specifically for pnpm 10+ and may not work correctly with npm or yarn.

## Making Changes

### For Code Changes:

1. **ALWAYS** run `pnpm install` first
2. Use `pnpm exec tsx src/index.ts` to test CLI changes immediately
3. Run `pnpm exec prettier --write .` before committing
4. Test with sample CSV files to verify functionality
5. Check that commands still show help properly

### Example Workflow:

```bash
# Setup
pnpm install

# Make changes to code
# ... edit files ...

# Test changes
pnpm exec tsx src/index.ts --help
pnpm exec tsx src/index.ts import-csv -f sample.csv -o test.journal

# Format before commit
pnpm exec prettier --write .

# Optional: Check types (will show known errors)
pnpm exec tsc --noEmit
```

### For New Features:

1. Follow the modular architecture (core/, features/, infrastructure/)
2. Add new CLI commands in `src/index.ts` using Commander pattern
3. Create handlers in appropriate feature directories
4. Use Zod schemas for validation (see existing schemas)

### File Structure Patterns:

- **Commands**: `features/{feature}/commands/` - Define command interfaces
- **Handlers**: `features/{feature}/handlers/` - Implement business logic
- **Schemas**: `features/{feature}/schemas/` - Zod validation schemas
- **Core Services**: `core/services/` - Cross-cutting concerns

## Dependencies

**Runtime Dependencies:**

- `commander` - CLI framework
- `csv-parser`, `csv-parse` - CSV processing
- `tsx` - TypeScript execution
- `zod` - Runtime validation
- `axios` - HTTP client

**Development Dependencies:**

- `typescript` - TypeScript compiler
- `prettier` - Code formatting
- `@types/node` - Node.js type definitions

## TRUST THESE INSTRUCTIONS

The information in this file has been validated by running commands and exploring the codebase. Only search for additional information if these instructions are incomplete or found to be incorrect. The project structure, build commands, and current limitations are accurately documented here.
