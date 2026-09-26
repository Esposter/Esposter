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
    "perfectionist/sort-vue-attributes": "off",
  },
});
