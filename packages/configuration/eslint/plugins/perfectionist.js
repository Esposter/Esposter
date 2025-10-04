import perfectionist from "eslint-plugin-perfectionist";
import { defineConfig } from "eslint/config";

export default defineConfig({
  ...perfectionist.configs["recommended-natural"],
  ignores: ["**/*.json"],
  rules: {
    ...perfectionist.configs["recommended-natural"].rules,
    "perfectionist/sort-imports": [
      "error",
      {
        ...perfectionist.configs["recommended-natural"].rules["perfectionist/sort-imports"][1],
        internalPattern: [],
      },
    ],
  },
});
