import nuxtPlugin from "@esposter/eslint/nuxtPlugin.js";
import typescriptRulesOverrides from "@esposter/eslint/overrides/typescriptRules.js";
import vueRulesOverrides from "@esposter/eslint/overrides/vueRules.js";
import typescriptIgnores from "@esposter/eslint/typescriptIgnores.js";
import typescriptRules from "@esposter/eslint/typescriptRules.js";
import withNuxt from "./.nuxt/eslint.config.mjs";

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
