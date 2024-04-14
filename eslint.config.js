import unocss from "@unocss/eslint-config/flat";
import pluginImport from "eslint-plugin-import-x";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  tseslint.config({
    files: ["*.ts"],
    extends: [...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        project: ".nuxt/tsconfig.json",
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variable",
          format: ["strictCamelCase", "UPPER_CASE"],
          types: ["boolean", "number", "string", "array"],
        },
      ],
      "@typescript-eslint/no-base-to-string": "off",
      "@typescript-eslint/no-redundant-type-constituents": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-enum-comparison": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/unbound-method": "off",
    },
  }),
  unocss,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      import: pluginImport,
    },
    rules: {
      "import/consistent-type-specifier-style": "error",
      curly: ["error", "multi"],
      eqeqeq: "error",
    },
  },
)
  .override("nuxt/typescript/rules", {
    rules: {
      "@typescript-eslint/ban-types": [
        "error",
        {
          types: {
            Omit: "Use `Except` instead",
            Function: false,
          },
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
    },
  })
  .override("nuxt/vue/rules", {
    rules: {
      "vue/no-unused-vars": "off",
      "vue/no-v-html": "off",
      "vue/no-v-text-v-html-on-component": "off",
      "vue/multi-word-component-names": "off",
      "vue/valid-template-root": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  });
