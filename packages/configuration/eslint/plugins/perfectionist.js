import { configs } from "eslint-plugin-perfectionist";
import { defineConfig } from "eslint/config";

export default defineConfig({
  ...configs["recommended-natural"],
  ignores: ["**/*.json"],
  rules: {
    ...configs["recommended-natural"].rules,
    "perfectionist/sort-imports": [
      "error",
      {
        ...configs["recommended-natural"].rules["perfectionist/sort-imports"][1],
        internalPattern: [],
      },
    ],
  },
});
