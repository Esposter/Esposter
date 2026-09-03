import jsonFilePatterns from "@esposter/configuration/eslint/jsonFilePatterns.js";
import vueRulesOverrides from "@esposter/configuration/eslint/overrides/vueRules.js";

export default {
  "nuxt/javascript": {
    ignores: jsonFilePatterns,
  },
  "nuxt/vue/rules": {
    rules: vueRulesOverrides,
  },
};
