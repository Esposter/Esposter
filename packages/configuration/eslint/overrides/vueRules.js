import restrictedEventSyntaxes from "@esposter/configuration/eslint/restrictedEventSyntaxes.js";

// What eslint-plugin-vue still runs once vize's lint (`vite/vueOptions.ts`) took the rest. It replaces the rule set of
// Nuxt's Vue block rather than merging into it, so a rule is on here because this map names it
export default {
  // Not covered by eslint-plugin-oxlint on vue files — its vue-svelte-astro-exceptions config
  // Deliberately keeps unused-vars rules enabled there, so this off is still load-bearing.
  "@typescript-eslint/no-unused-vars": "off",
  // Nuxt's Vue block keeps it off for components, whose script bindings the template reads where ESLint cannot see
  "no-useless-assignment": "off",
  // `<script setup>` is the only component authoring style here. The Options API runtime is compiled out of the
  // Bundle entirely (Nuxt 5 defaults `vue.optionsApi` off), so an options component of
  // Ours would mount against a runtime that cannot apply it and fail at render rather than at build. Plain
  // `defineComponent(...)` composition is banned with it: it buys nothing script setup does not, and leaving it
  // Allowed is what lets an options block back in one property at a time.
  "vue/component-api-style": ["error", ["script-setup"]],
  // PascalCase for our components and PascalCase third-party (VuePdfEmbed); kebab-case is only for
  // TresJS's lowercase <primitive> special element, and a `v-*` tag is left to the Vuetify ban in
  // `vue/no-restricted-syntax` rather than reported twice. A compound part is PascalCase on both sides of its dot
  // (Vuetify 0's `Select.Root`), since the library exports each compound as one namespace object. The
  // `registeredComponentsOnly` option is useless under Nuxt auto-imports (nothing is locally registered), so every
  // Non-HTML tag is checked.
  // @TODO: no upstream issue — vize's vue/component-name-in-template-casing has no ignores for TresJS's <primitive> (ubugeeei-prod/vize)
  "vue/component-name-in-template-casing": [
    "error",
    "PascalCase",
    {
      ignores: ["/^v-/", "primitive", String.raw`/^[A-Z][A-Za-z]*\.[A-Z][A-Za-z]*$/`],
      registeredComponentsOnly: false,
    },
  ],
  // @TODO: no upstream issue — vize has no first-attribute-linebreak rule (ubugeeei-prod/vize)
  "vue/first-attribute-linebreak": "warn",
  // The bare `@click.stop` ban reads the directive's modifiers, which vize's template tree does not expose
  // @TODO: no upstream issue — vize's VDirectiveKey has no modifier nodes for vue/no-restricted-syntax to match (ubugeeei-prod/vize)
  "vue/no-restricted-syntax": ["error", ...restrictedEventSyntaxes],
  // @TODO: no upstream issue — vize has no padding-line-between-blocks rule (ubugeeei-prod/vize)
  "vue/padding-line-between-blocks": ["error", "always"],
  // @TODO: no upstream issue — vize's vue/v-bind-style has no same-name shorthand option (ubugeeei-prod/vize)
  "vue/v-bind-style": ["error", "shorthand", { sameNameShorthand: "always" }],
};
