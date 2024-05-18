import withNuxt from "../app/.nuxt/eslint.config.mjs";
import languageOptions from "./languageOptions.js";
import nuxtPlugin from "./nuxtPlugin.js";
import typescriptRulesOverrides from "./overrides/typescriptRules.js";
import vueRulesOverrides from "./overrides/vueRules.js";
import typescriptIgnores from "./typescriptIgnores.js";
import typescriptRules from "./typescriptRules.js";

export default withNuxt(nuxtPlugin).overrides({
  "nuxt/typescript/rules": {
    languageOptions,
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
