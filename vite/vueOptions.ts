import type { VueOptions } from "vize";

// The template rules, which vize's own lint runs over each component: oxlint reads only a component's script. The
// Incremental preset runs the rules listed here and nothing vize would add by default, so a rule is on because this
// Map names it
export const VUE_OPTIONS: VueOptions = {
  linter: { preset: "incremental", rules: { "vue/require-v-for-key": "error" } },
};
