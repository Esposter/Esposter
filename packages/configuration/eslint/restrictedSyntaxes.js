// Entries shared between script (`no-restricted-syntax` in typescriptRules) and template expressions
// (`vue/no-restricted-syntax` in vueRules) — the two rules scan disjoint parts of an SFC, so a ban that
// Applies to both contexts must be spread into both.
export default [
  {
    // `router.replace({ query })` is a query-string update, not navigation, so only `push` is banned.
    message:
      "Use `navigateTo(target, { replace: true })` instead of `router.push` for navigation. (`router.replace({ query })` for query-only updates is fine.)",
    selector:
      "CallExpression[callee.property.name='push']:matches([callee.object.name=/^\\$?router$/], [callee.object.callee.name='useRouter'], [callee.object.property.name='$router'])",
  },
  {
    // Banned outright (no Vue modifier exists for it, and it couples behavior to listener registration order).
    message:
      "stopImmediatePropagation is banned — it couples behavior to listener registration order. Restructure the handlers (or use @event.stop) instead.",
    selector: "CallExpression[callee.property.name='stopImmediatePropagation']",
  },
];
