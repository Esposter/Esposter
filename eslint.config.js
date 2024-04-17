import unocss from "@unocss/eslint-config/flat";
import pluginImport from "eslint-plugin-import-x";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  {
    plugins: {
      import: pluginImport,
    },
    rules: {
      "import/consistent-type-specifier-style": "error",
      eqeqeq: "error",
    },
  },
  tseslint.config({
    files: ["*.ts"],
    extends: [
      // Remove @typescript-eslint plugin to avoid redefine error
      // since nuxt will handle defining this plugin
      ...tseslint.configs.strictTypeChecked.map((c) => ({ ...c, plugins: {} })),
      ...tseslint.configs.stylisticTypeChecked.map((c) => ({ ...c, plugins: {} })),
    ],
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
    rules: {
      curly: ["error", "multi"],
    },
  },
).overrides({
  "nuxt/typescript/rules": {
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
  },
  "nuxt/vue/rules": {
    rules: {
      "vue/no-unused-vars": "off",
      "vue/no-v-html": "off",
      "vue/no-v-text-v-html-on-component": "off",
      "vue/multi-word-component-names": "off",
      "vue/valid-template-root": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
});
