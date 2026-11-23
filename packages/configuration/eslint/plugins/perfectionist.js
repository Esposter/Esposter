import { configs } from "eslint-plugin-perfectionist";
import { defineConfig } from "eslint/config";

/** @type {import("@eslint/core").ConfigObject} */
const configuration = configs["recommended-natural"];

export default defineConfig({
  ...configuration,
  rules: {
    ...configuration.rules,
    // Oxfmt sorts the imports (`sortImports` in `oxfmtConfiguration.ts`)
    "perfectionist/sort-imports": "off",
    // A citty command reads its positional arguments in the order they are declared, so the objects inside a
    // `defineCommand` call, and an arguments object shared between commands (named `…Args`), keep the order written
    // A numeric value set (a PascalCase const object of numbers, negative ones included) is ordered by its values, as a
    // Numeric enum was
    "perfectionist/sort-objects": [
      "error",
      {
        sortBy: "value",
        type: "natural",
        useConfigurationIf: {
          matchesAstSelector:
            'VariableDeclarator[id.name=/^[A-Z][a-z]/] > TSAsExpression > ObjectExpression:not(:has(> Property:not([value.value=type(number)]):not([value.operator="-"][value.argument.value=type(number)])))',
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
