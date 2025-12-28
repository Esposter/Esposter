import depend from "@esposter/configuration/eslint/plugins/depend.js";
import perfectionist from "@esposter/configuration/eslint/plugins/perfectionist.js";
import vitest from "@esposter/configuration/eslint/plugins/vitest.js";
import unocss from "@unocss/eslint-config/flat";
import pinia from "eslint-plugin-pinia";
import { defineConfig } from "eslint/config";

export default defineConfig(depend, perfectionist, pinia.configs["all-flat"], unocss, vitest, {
  rules: {
    curly: ["error", "multi"],
    eqeqeq: "error",
    "import/consistent-type-specifier-style": "error",
    "object-shorthand": ["error", "always"],
    "perfectionist/sort-vue-attributes": "off",
    "pinia/require-setup-store-properties-export": "off",
  },
});
