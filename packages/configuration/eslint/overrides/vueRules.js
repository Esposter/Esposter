import restrictedEventSyntaxes from "@esposter/configuration/eslint/restrictedEventSyntaxes.js";

// What eslint-plugin-vue still runs once vize's lint (`vite/vueOptions.ts`) took the rest. It replaces the rule set of
// Nuxt's Vue block rather than merging into it, so a rule is on here because this map names it
export default {
  // Not covered by eslint-plugin-oxlint on vue files — its vue-svelte-astro-exceptions config
  // Deliberately keeps unused-vars rules enabled there, so this off is still load-bearing.
  "@typescript-eslint/no-unused-vars": "off",
  // Nuxt's Vue block keeps it off for components, whose script bindings the template reads where ESLint cannot see
  "no-useless-assignment": "off",
  // PascalCase for our components and PascalCase third-party (VuePdfEmbed); kebab-case is only for
  // TresJS's lowercase <primitive> special element, and a `v-*` tag is left to the Vuetify ban in
  // `vue/no-restricted-syntax` rather than reported twice. A compound part is PascalCase on both sides of its dot
  // (Vuetify 0's `Select.Root`), since the library exports each compound as one namespace object. The
  // `registeredComponentsOnly` option is useless under Nuxt auto-imports (nothing is locally registered), so every
  // Non-HTML tag is checked.
  // @TODO: https://github.com/ubugeeei-prod/vize/issues/13537
  "vue/component-name-in-template-casing": [
    "error",
    "PascalCase",
    {
      ignores: ["/^v-/", "primitive", String.raw`/^[A-Z][A-Za-z]*\.[A-Z][A-Za-z]*$/`],
      registeredComponentsOnly: false,
    },
  ],
  // The bare `@click.stop` ban reads the directive's modifiers, which vize's template tree does not expose
  // @TODO: https://github.com/ubugeeei-prod/vize/issues/13534 — move the ban to vize's list once its tree carries modifiers
  "vue/no-restricted-syntax": ["error", ...restrictedEventSyntaxes],
  // @TODO: https://github.com/ubugeeei-prod/vize/issues/13538
  "vue/padding-line-between-blocks": ["error", "always"],
  // @TODO: https://github.com/ubugeeei-prod/vize/issues/13535
  "vue/v-bind-style": ["error", "shorthand", { sameNameShorthand: "always" }],
};
