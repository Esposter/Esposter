import jsonFilePatterns from "@esposter/configuration/eslint/jsonFilePatterns.js";
import { configs } from "eslint-plugin-perfectionist";
import { defineConfig } from "eslint/config";

/** @type {import("@eslint/core").ConfigObject} */
const configuration = configs["recommended-natural"];

export default defineConfig({
  ...configuration,
  ignores: jsonFilePatterns,
  rules: {
    ...configuration.rules,
    "perfectionist/sort-imports": [
      "error",
      {
        ...configuration.rules["perfectionist/sort-imports"][1],
        internalPattern: [],
        // A comment is a fixed boundary the sort never carries along, so a file-level directive over the first
        // Import stays on line 1 — `import/newline-after-import` alone decides whether a comment may sit in the block
        partitionByComment: true,
      },
    ],
    // A citty command reads its positional arguments in the order they are declared, so the objects inside a
    // `defineCommand` call, and an arguments object shared between commands (named `…Args`), keep the order written
    // A numeric value set (a PascalCase const object of numbers) is ordered by its values, as a numeric enum was
    "perfectionist/sort-objects": [
      "error",
      {
        sortBy: "value",
        type: "natural",
        useConfigurationIf: {
          matchesAstSelector:
            "VariableDeclarator[id.name=/^[A-Z][a-z]/] > TSAsExpression > ObjectExpression:not(:has(> Property:not([value.value=type(number)])))",
        },
      },
      {
        type: "unsorted",
        useConfigurationIf: { callingFunctionNamePattern: { pattern: "^defineCommand$", scope: "deep" } },
      },
      { type: "unsorted", useConfigurationIf: { declarationMatchesPattern: "Args$" } },
      configuration.rules["perfectionist/sort-objects"][1],
    ],
    "perfectionist/sort-vue-attributes": "off",
  },
});
