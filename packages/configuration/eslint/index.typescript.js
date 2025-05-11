import languageOptions from "@esposter/configuration/eslint/languageOptions.js";
import nuxtPlugin from "@esposter/configuration/eslint/nuxtPlugin.js";
import typescriptRulesOverrides from "@esposter/configuration/eslint/overrides/typescriptRules.js";
import vueRulesOverrides from "@esposter/configuration/eslint/overrides/vueRules.js";
import typescriptIgnores from "@esposter/configuration/eslint/typescriptIgnores.js";
import typescriptRules from "@esposter/configuration/eslint/typescriptRules.js";

import withNuxt from "../../app/.nuxt/eslint.config.mjs";
/**
 * Unfortunately, running all typescript-eslint rules in vue files is so slow, it's unrealistic to put it in CI/CD,
 * so we have a light version that lints the extra typescript-eslint rules only in ts files so we can use it in CI/CD
 */
export default withNuxt(nuxtPlugin, {
  files: ["**/*.ts"],
  languageOptions,
  rules: typescriptRules,
}).overrides({
  "nuxt/typescript/rules": {
    ignores: typescriptIgnores,
    rules: typescriptRulesOverrides,
  },
  "nuxt/vue/rules": {
    rules: vueRulesOverrides,
  },
});
