import vue from "@esposter/configuration/eslint/index.vue.js";
import unocss from "@esposter/configuration/eslint/plugins/unocss.js";

// A Vue package styled by scoped CSS alone, such as one matching a game's measured values rather than the app's design
// System: every UnoCSS rule off, since they need a UnoCSS config to load and have no utility here to check
export default vue.append({
  rules: Object.fromEntries(unocss.flatMap(({ rules = {} }) => Object.keys(rules)).map((rule) => [rule, "off"])),
});
