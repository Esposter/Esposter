import languageOptions from "@esposter/configuration/eslint/languageOptions.js";
import nuxtPlugin from "@esposter/configuration/eslint/nuxtPlugin.js";
import typescriptRulesOverrides from "@esposter/configuration/eslint/overrides/typescriptRules.js";
import vueRulesOverrides from "@esposter/configuration/eslint/overrides/vueRules.js";
import typescriptIgnores from "@esposter/configuration/eslint/typescriptIgnores.js";
import typescriptRules from "@esposter/configuration/eslint/typescriptRules.js";
import oxlint from "eslint-plugin-oxlint";

export default withNuxt(nuxtPlugin)
  .overrides({
    "nuxt/typescript/rules": {
      ignores: typescriptIgnores,
      languageOptions,
      rules: {
        ...typescriptRules,
        ...typescriptRulesOverrides,
      },
    },
    "nuxt/vue/rules": {
      rules: vueRulesOverrides,
    },
  })
  .append(...oxlint.buildFromOxlintConfigFile("./.oxlintrc.json"));
