# Contributing to Cardmarket Accounting

Thank you for your interest in contributing to Cardmarket Accounting! This guide will help you understand our development process and standards.

## Table of Contents

- [Development Setup](#development-setup)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

## Development Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm 10+ (required - see `packageManager` field in `package.json`)

### Installation

1. Fork and clone the repository
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Run tests to ensure everything is working:

   ```bash
   pnpm test
   pnpm run lint
   pnpm run type-check
   ```

### Local Development

```bash
# Run the CLI directly with TypeScript
pnpm exec tsx src/index.ts --help

# Format code
pnpm run format

# Run linter
pnpm run lint

# Type check
pnpm run type-check

# Build for production
pnpm run build
```

## Commit Message Guidelines

This project follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. This enables automated changelog generation and semantic versioning.

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: A new feature for the user
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semi colons, etc.)
- **refactor**: Code changes that neither fix a bug nor add a feature
- **perf**: Performance improvements
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes to build system or external dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Examples

#### Feature

```bash
feat: add CSV export functionality for ledger entries

Add new command `export-csv` that converts hledger journal format
back to CSV for compatibility with external tools.

Closes #123
```

#### Bug Fix

```bash
fix: handle empty CSV rows in parser

The CSV parser was crashing when encountering completely empty rows.
Now it skips them with a warning message.

Fixes #456
```

#### Documentation

```bash
docs: update installation instructions

- Add Node.js version requirement
- Clarify pnpm installation steps
- Add troubleshooting section
```

#### Breaking Changes

```bash
feat!: change default output format to JSON

BREAKING CHANGE: The default output format is now JSON instead of
hledger journal format. Use --format=journal to maintain previous behavior.
```

Or with body:

```bash
feat: remove deprecated CSV import options

BREAKING CHANGE: The following options have been removed:
- --legacy-format
- --old-headers

Use the new --mapping-config option instead.
```

### Scopes (Optional)

You can specify the area of the codebase being changed:

```bash
feat(cli): add new import command
fix(parser): handle malformed dates in CSV
docs(readme): update usage examples
test(core): add unit tests for ledger formatter
```

Common scopes:

- `cli` - Command line interface
- `parser` - CSV parsing logic
- `core` - Core business logic
- `mapper` - Data mapping functionality
- `config` - Configuration handling
- `deps` - Dependencies

### Local Validation

Before committing, your commit messages are automatically validated using:

1. **Husky pre-commit hook**: Runs linting, formatting checks, and type checking
2. **Husky commit-msg hook**: Validates commit message format against Conventional Commits spec

If your commit message doesn't follow the format, the commit will be rejected with an error message explaining what needs to be fixed.

You can test commit message validation manually:

```bash
echo "your commit message" | pnpm exec commitlint
```

### Server-side Validation

All commits pushed to GitHub are also validated by our CI pipeline. If commit messages don't follow the Conventional Commits format, the CI checks will fail.

## Pull Request Process

1. **Create a feature branch** from `main`:

   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes** following our coding standards:

   - Follow the existing code style (enforced by Prettier and ESLint)
   - Add tests for new functionality
   - Update documentation as needed

3. **Commit your changes** using Conventional Commits format:

   ```bash
   git commit -m "feat: add new feature description"
   ```

4. **Push to your fork** and create a Pull Request

5. **Ensure all checks pass**:

   - All tests must pass
   - Code must be formatted correctly
   - No linting errors
   - Commit messages must follow Conventional Commits format
   - Type checking must pass

6. **Address review feedback** and update your PR as needed

### PR Title Format

PR titles should also follow Conventional Commits format as they may be used for squash merge commits:

```
feat: add CSV export functionality
fix: resolve memory leak in parser
docs: update API documentation
```

## Release Process

This project uses [Release Please](https://github.com/googleapis/release-please) for automated releases:

1. **Conventional commits** are analyzed to determine the next version number:

   - `feat:` commits trigger a **minor** version bump
   - `fix:` commits trigger a **patch** version bump
   - `feat!:` or commits with `BREAKING CHANGE:` trigger a **major** version bump

2. **Automated PRs** are created by Release Please to:

   - Update version in `package.json`
   - Generate/update `CHANGELOG.md`
   - Create a release commit

3. **Manual review and merge** of the Release Please PR triggers:
   - Creation of a Git tag
   - GitHub release with generated release notes
   - (Optional) Publishing to npm registry

### Changelog Generation

The changelog is automatically generated from commit messages:

- `feat:` commits appear under "Features"
- `fix:` commits appear under "Bug Fixes"
- `BREAKING CHANGE:` commits are highlighted prominently
- Other commit types may be included based on configuration

This is why following the Conventional Commits format is crucial - it directly impacts the quality of our release notes and changelog.

## Questions?

If you have questions about contributing or need help with the development setup, please:

1. Check the [README.md](README.md) for basic usage information
2. Look through existing [Issues](https://github.com/Poltergeist/cardmarket-accounting/issues)
3. Open a new issue with the `question` label

Thank you for contributing! 🎉
