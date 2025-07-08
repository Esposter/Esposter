import unocss from "@unocss/eslint-config/flat";
import vitest from "@vitest/eslint-plugin";
import perfectionist from "eslint-plugin-perfectionist";
import pinia from "eslint-plugin-pinia";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

export default tseslint.config(
  pinia.configs["all-flat"],
  unocss,
  {
    files: ["**/**.test.ts", "**/**.test-d.ts"],
    languageOptions: {
      globals: vitest.environments.env.globals,
      parserOptions: {
        projectService: "tsconfig.json",
      },
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
