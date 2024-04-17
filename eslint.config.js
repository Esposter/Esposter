import withNuxt from "./.nuxt/eslint.config.mjs";
import nuxtPlugin from "./eslint/nuxtPlugin.js";
import typescriptOverrides from "./eslint/overrides/typescript.js";
import vueOverrides from "./eslint/overrides/vue.js";
import typescript from "./eslint/typescript.js";

export default withNuxt(nuxtPlugin).overrides({
  "nuxt/typescript/rules": {
    languageOptions: {
      parserOptions: {
        project: ".nuxt/tsconfig.json",
      },
    },
    ...Object.assign({}, typescript, typescriptOverrides),
  },
  "nuxt/vue/rules": vueOverrides,
});
