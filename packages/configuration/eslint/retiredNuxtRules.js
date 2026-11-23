// The Nuxt and Link-checker rules both ESLint configs delete
// (`openspec/changes/architecture-eslint-retirement/design.md`, Decisions)
const RETIRED_NUXT_RULES = [
  "nuxt/rules",
  "nuxt/pages",
  "nuxt/nuxt-config",
  "nuxt-link-checker/valid-route",
  "nuxt-link-checker/valid-route-markdown",
];

// `remove` takes one name, so each retired rule is removed from the chain in turn
export const removeRetiredNuxtRules = (config) =>
  RETIRED_NUXT_RULES.reduce((chain, name) => chain.remove(name), config);
