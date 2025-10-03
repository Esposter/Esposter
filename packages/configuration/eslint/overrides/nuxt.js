import vueRulesOverrides from "@esposter/configuration/eslint/overrides/vueRules.js";

export default {
  "nuxt/javascript": {
    ignores: ["**/*.json"],
  },
  "nuxt/vue/rules": {
    rules: vueRulesOverrides,
  },
};
