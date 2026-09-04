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
      },
    ],
    "perfectionist/sort-vue-attributes": "off",
  },
});
