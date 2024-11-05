import withNuxt from "../../app/.nuxt/eslint.config.mjs";
import languageOptions from "./languageOptions.js";
import nuxtPlugin from "./nuxtPlugin.js";
import typescriptRulesOverrides from "./overrides/typescriptRules.js";
import vueRulesOverrides from "./overrides/vueRules.js";
import typescriptIgnores from "./typescriptIgnores.js";
import typescriptRules from "./typescriptRules.js";
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
    rules: typescriptRulesOverrides,
    ignores: typescriptIgnores,
  },
  "nuxt/vue/rules": {
    rules: vueRulesOverrides,
  },
});
