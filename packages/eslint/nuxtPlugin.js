import unocss from "@unocss/eslint-config/flat";
import pluginImport from "eslint-plugin-import-x";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    plugins: {
      import: pluginImport,
    },
    rules: {
      "import/consistent-type-specifier-style": "error",
      eqeqeq: "error",
    },
  },
  unocss,
  eslintPluginPrettierRecommended,
  {
    rules: {
      curly: ["error", "multi"],
      "object-shorthand": ["error", "always"],
    },
  },
);
