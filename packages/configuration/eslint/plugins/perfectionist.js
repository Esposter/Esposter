import { configs } from "eslint-plugin-perfectionist";
import { defineConfig } from "eslint/config";
/** @type {import("@eslint/core").ConfigObject} */
const config = configs["recommended-natural"];

export default defineConfig({
  ...configs["recommended-natural"],
  ...config,
  ignores: ["**/*.json"],
  rules: {
    ...configs["recommended-natural"].rules,
    ...config.rules,
    "perfectionist/sort-imports": [
      "error",
      {
        ...configs["recommended-natural"].rules["perfectionist/sort-imports"][1],
        ...config.rules["perfectionist/sort-imports"][1],
        internalPattern: [],
      },
    ],
  },
});
