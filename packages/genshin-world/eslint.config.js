import vue from "@esposter/configuration/eslint/index.vue.js";

// The world's templates are three.js scene graphs with no class or style, so UnoCSS's rules, which need a UnoCSS
// Config to load, have nothing here to check
export default vue.append({
  rules: { "unocss/blocklist": "off", "unocss/order": "off", "unocss/order-attributify": "off" },
});
