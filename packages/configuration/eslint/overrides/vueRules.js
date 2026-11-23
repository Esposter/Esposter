// What eslint-plugin-vue still runs once vize's lint (`vite/vueOptions.ts`) and `templateTextRules.test.ts` took the rest. It replaces the rule set of
// Nuxt's Vue block rather than merging into it, so a rule is on here because this map names it
export default {
  // Not covered by eslint-plugin-oxlint on vue files — its vue-svelte-astro-exceptions config
  // Deliberately keeps unused-vars rules enabled there, so this off is still load-bearing.
  "@typescript-eslint/no-unused-vars": "off",
  // Nuxt's Vue block keeps it off for components, whose script bindings the template reads where ESLint cannot see
  "no-useless-assignment": "off",
};
