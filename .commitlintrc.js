/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Ensure type is one of the allowed types
    "type-enum": [
      2,
      "always",
      [
        "feat", // A new feature
        "fix", // A bug fix
        "docs", // Documentation only changes
        "style", // Changes that do not affect the meaning of the code
        "refactor", // A code change that neither fixes a bug nor adds a feature
        "perf", // A code change that improves performance
        "test", // Adding missing tests or correcting existing tests
        "build", // Changes that affect the build system or external dependencies
        "ci", // Changes to CI configuration files and scripts
        "chore", // Other changes that don't modify src or test files
        "revert", // Reverts a previous commit
      ],
    ],
    // Ensure subject case is sentence-case (capitalize first letter)
    "subject-case": [2, "never", ["pascal-case", "upper-case"]],
    // Ensure subject doesn't end with a period
    "subject-full-stop": [2, "never", "."],
    // Limit subject line length
    "subject-max-length": [2, "always", 100],
    // Ensure subject is not empty
    "subject-empty": [2, "never"],
    // Limit header line length (type + subject)
    "header-max-length": [2, "always", 100],
    // Ensure body has leading blank line
    "body-leading-blank": [2, "always"],
    // Ensure footer has leading blank line
    "footer-leading-blank": [2, "always"],
  },
};
