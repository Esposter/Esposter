import vueRulesOverrides from "@esposter/configuration/eslint/overrides/vueRules.js";

export default { "nuxt/vue/rules": (configuration) => ({ ...configuration, rules: vueRulesOverrides }) };
