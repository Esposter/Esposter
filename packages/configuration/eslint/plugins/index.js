import depend from "@esposter/configuration/eslint/plugins/depend.js";
import json from "@esposter/configuration/eslint/plugins/json.js";
import perfectionist from "@esposter/configuration/eslint/plugins/perfectionist.js";
import vitest from "@esposter/configuration/eslint/plugins/vitest.js";
import unocss from "@unocss/eslint-config/flat";
import pinia from "eslint-plugin-pinia";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import { defineConfig } from "eslint/config";

export default defineConfig(
  depend,
  json,
  perfectionist,
  pinia.configs["all-flat"],
  unocss,
  vitest,
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
