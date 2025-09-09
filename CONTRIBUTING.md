# Contributing to Cardmarket Accounting

Thank you for your interest in contributing to Cardmarket Accounting! This guide will help you understand our development process and standards.

## Table of Contents

- [Getting Started](#getting-started)
- [Commit Message Format](#commit-message-format)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

## Getting Started

1. **Fork the repository** and create your branch from `main`:

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Install dependencies** (requires pnpm 10+):

   ```bash
   pnpm install
   ```

3. **Run the full validation suite**:
   ```bash
   pnpm run type-check
   pnpm run lint
   pnpm run format:check
   pnpm test
   ```

## Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/) for all commit messages. This allows us to automatically generate changelogs and determine semantic version bumps.

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies (pnpm, npm, etc)
- **ci**: Changes to CI configuration files and scripts (.github/workflows/, etc)
- **chore**: Other changes that don't modify src or test files (updating dependencies, etc)
- **revert**: Reverts a previous commit

### Examples

#### Good Commit Messages ✅

```bash
feat: add CSV import functionality for Cardmarket orders

feat(cli): add --output flag to specify journal file location

fix: handle empty CSV files gracefully

fix(parser): resolve null pointer exception in date parsing

docs: update README with installation instructions

test: add unit tests for HledgerFormatter

build: upgrade TypeScript to 5.8.3

ci: add commit message validation workflow

chore: update dependencies to latest versions

perf(csv): optimize memory usage for large files
```

#### Bad Commit Messages ❌

```bash
# Missing type
Add new feature

# Type not lowercase
Feat: add something

# Description not descriptive enough
fix: bug

# Subject too long (over 100 characters)
feat: add a really long description that exceeds the maximum allowed length for commit messages according to our standards

# Missing description
feat:

# Ending with period
feat: add new feature.
```

### Breaking Changes

For breaking changes, add a `!` after the type or add `BREAKING CHANGE:` in the footer:

```bash
feat!: remove deprecated CLI options

# or

feat: add new authentication system

BREAKING CHANGE: removes the old API key authentication method
```

### Commit Message Validation

- **Local validation**: Husky will automatically lint your commit messages when you commit
- **CI validation**: GitHub Actions will validate commit messages on push and PR
- **Squash merges**: When PRs are merged, ensure the final commit message follows conventional commits

## Development Workflow

1. **Create a feature branch**:

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** following our code standards

3. **Run tests and linting**:

   ```bash
   pnpm run type-check
   pnpm run lint
   pnpm run test
   ```

4. **Format your code**:

   ```bash
   pnpm run format
   ```

5. **Commit with conventional commit message**:

   ```bash
   git commit -m "feat: add your feature description"
   ```

6. **Push and create a Pull Request**

## Code Standards

### TypeScript

- Use TypeScript 5.8.3 features
- Enable strict mode (already configured)
- Provide proper type annotations
- Use interfaces for object shapes
- Use enums for constants

### ESLint

- Follow the existing ESLint configuration
- Fix all linting errors before committing
- Use `pnpm run lint:fix` for automatic fixes

### Prettier

- Use Prettier for code formatting
- Run `pnpm run format` before committing
- Configuration is in `.prettierrc` (if present) or defaults

### Project Structure

```
src/
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

## Testing

- **Unit tests**: Test core domain models and services
- **Integration tests**: Test CLI functionality
- **Coverage**: Aim for good test coverage on business logic
- **Test files**: Place in `tests/` directory with `.test.ts` extension

### Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm run test:coverage

# Watch mode for development
pnpm run test:watch
```

## Pull Request Process

1. **Ensure your PR has a descriptive title** (preferably following conventional commit format)
2. **Fill out the PR template** with relevant information
3. **Link any related issues** using "Fixes #123" or "Closes #123"
4. **Ensure all CI checks pass**:
   - Type checking
   - Linting
   - Formatting
   - Tests
   - Commit message validation
5. **Request review** from maintainers
6. **Address feedback** and update your branch as needed

### PR Title Format

PR titles should follow conventional commit format as they will become the commit message when squash-merged:

```bash
feat: add new feature
fix: resolve bug in CSV parsing
docs: update contributing guidelines
```

## Release Process

This project uses [release-please](https://github.com/googleapis/release-please) for automated releases:

- **Conventional commits** determine the semantic version bump
- **Changelogs** are automatically generated from commit messages
- **Releases** are created automatically when merged to main
- **Version** is updated in package.json automatically

### Version Bumps

- `feat`: Minor version bump (1.0.0 → 1.1.0)
- `fix`: Patch version bump (1.0.0 → 1.0.1)
- `feat!` or `BREAKING CHANGE`: Major version bump (1.0.0 → 2.0.0)

## Questions and Support

- **Issues**: Open a [GitHub issue](https://github.com/Poltergeist/cardmarket-accounting/issues)
- **Discussions**: Use GitHub Discussions for questions
- **Maintainer**: [@Poltergeist](https://github.com/Poltergeist)

Thank you for contributing to Cardmarket Accounting! 🎉
