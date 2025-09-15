import json from "@eslint/json";
import unocss from "@unocss/eslint-config/flat";
import vitest from "@vitest/eslint-plugin";
import perfectionist from "eslint-plugin-perfectionist";
import pinia from "eslint-plugin-pinia";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import { defineConfig } from "eslint/config";

export default defineConfig(
  pinia.configs["all-flat"],
  unocss,
  {
    files: ["**/**.test.ts", "**/**.test-d.ts"],
    languageOptions: {
      globals: vitest.environments.env.globals,
    },
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.all.rules,
      "vitest/consistent-test-it": ["error", { fn: "test" }],
      "vitest/max-expects": "off",
      "vitest/no-hooks": "off",
      "vitest/no-importing-vitest-globals": "off",
      "vitest/no-interpolation-in-snapshots": "off",
      "vitest/prefer-to-be-falsy": "off",
      "vitest/prefer-to-be-truthy": "off",
      "vitest/require-hook": "off",
    },
    settings: {
      vitest: {
        typecheck: true,
      },
    },
  },
  {
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
  },
  {
    extends: ["json/recommended"],
    files: ["**/*.json"],
    ignores: ["**/migrations/**/*.json", "**/tilemap.json"],
    language: "json/json",
    plugins: { json },
    rules: {
      // @TODO: https://github.com/eslint/json/issues/122
      // "json/sort-keys": "error",
      "json/top-level-interop": "error",
    },
  },
  eslintPluginPrettierRecommended,
  {
    rules: {
      curly: ["error", "multi"],
      eqeqeq: "error",
      "import/consistent-type-specifier-style": "error",
      "object-shorthand": ["error", "always"],
      "perfectionist/sort-vue-attributes": "off",
      "pinia/require-setup-store-properties-export": "off",
    },
  },
);
