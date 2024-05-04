import withNuxt from "./.nuxt/eslint.config.mjs";
import nuxtPlugin from "./eslint/nuxtPlugin.js";
import typescriptRulesOverrides from "./eslint/overrides/typescriptRules.js";
import vueRulesOverrides from "./eslint/overrides/vueRules.js";
import typescriptIgnores from "./eslint/typescriptIgnores.js";
import typescriptRules from "./eslint/typescriptRules.js";

export default withNuxt(nuxtPlugin).overrides({
  "nuxt/typescript/rules": {
    languageOptions: {
      parserOptions: {
        project: ".nuxt/tsconfig.json",
      },
    },
    rules: {
      ...typescriptRules,
      ...typescriptRulesOverrides,
    },
    ignores: typescriptIgnores,
  },
  "nuxt/vue/rules": {
    rules: vueRulesOverrides,
  },
});
