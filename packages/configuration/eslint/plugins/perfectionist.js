import { configs } from "eslint-plugin-perfectionist";
import { defineConfig } from "eslint/config";
/** @type {import("@eslint/core").ConfigObject} */
const config = configs["recommended-natural"];

export default defineConfig({
  ...config,
  ignores: ["**/*.json"],
  rules: {
    ...config.rules,
    "perfectionist/sort-imports": [
      "error",
      {
        ...config.rules["perfectionist/sort-imports"][1],
        internalPattern: [],
      },
    ],
  },
});
