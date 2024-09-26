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
    files: ["**.test.ts"],
    plugins: {
      vitest,
    },
    rules: vitest.configs.all.rules,
    settings: {
      vitest: {
        typecheck: true,
      },
    },
    languageOptions: {
      globals: vitest.environments.env.globals,
    },
  },
  perfectionist.configs["recommended-natural"],
  {
    rules: {
      curly: ["error", "multi"],
      eqeqeq: "error",
      "import/consistent-type-specifier-style": "error",
      "object-shorthand": ["error", "always"],
      "perfectionist/sort-vue-attributes": "off",
      "pinia/require-setup-store-properties-export": "off"
    },
  },
  eslintPluginPrettierRecommended,
);
