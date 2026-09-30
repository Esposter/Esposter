import vue from "@esposter/configuration/eslint/index.vue.js";

// The interface is styled by scoped CSS with the game's own measured values, never UnoCSS, so UnoCSS's rules, which
// Need a UnoCSS config to load, have nothing here to check
export default vue.append({
  rules: { "unocss/blocklist": "off", "unocss/order": "off", "unocss/order-attributify": "off" },
});
