import nuxtPlugin from "@esposter/eslint/nuxtPlugin.js";
import typescriptRulesOverrides from "@esposter/eslint/overrides/typescriptRules.js";
import vueRulesOverrides from "@esposter/eslint/overrides/vueRules.js";
import typescriptIgnores from "@esposter/eslint/typescriptIgnores.js";
import typescriptRules from "@esposter/eslint/typescriptRules.js";
import withNuxt from "./.nuxt/eslint.config.mjs";

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
