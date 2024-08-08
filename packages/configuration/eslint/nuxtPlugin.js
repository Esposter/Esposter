import unocss from "@unocss/eslint-config/flat";
import perfectionist from "eslint-plugin-perfectionist";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    rules: {
      "import/consistent-type-specifier-style": "error",
      eqeqeq: "error",
    },
  },
  unocss,
  perfectionist.configs["recommended-natural"],
  {
    rules: {
      "perfectionist/sort-vue-attributes": "off",
    },
  },
  eslintPluginPrettierRecommended,
  {
    rules: {
      curly: ["error", "multi"],
      "object-shorthand": ["error", "always"],
    },
  },
);
