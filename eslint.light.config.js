import withNuxt from "./.nuxt/eslint.config.mjs";
import nuxtPlugin from "./eslint/nuxtPlugin.js";
import typescriptRulesOverrides from "./eslint/overrides/typescriptRules.js";
import vueRulesOverrides from "./eslint/overrides/vueRules.js";
import typescriptIgnores from "./eslint/typescriptIgnores.js";
import typescriptRules from "./eslint/typescriptRules.js";

/**
 * Unfortunately, running all typescript-eslint rules in vue files is so slow, it's unrealistic to put it in CI/CD,
 * so we have a light version that lints the extra typescript-eslint rules only in ts files so we can use it in CI/CD
 */
export default withNuxt(nuxtPlugin, {
  files: ["*.ts"],
  languageOptions: {
    parserOptions: {
      project: ".nuxt/tsconfig.json",
    },
  },
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
