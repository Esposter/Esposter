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
    // The `.then`/`.catch`/`.finally` ban is the other half of the try/catch one in typescriptRules: both shapes
    // Route a failure past the Result the caller is supposed to read. The promise-queue exception the
    // Error-handling skill names, and the two primitives that wrap a synchronously-throwing callback, disable
    // This rule on the line with their reason — there is nowhere else the shape is correct.
    message:
      "Use `getResult`/`getResultAsync` + `.match` instead of `.then`/`.catch`/`.finally` (`withFinalizer` for cleanup) — see the error-handling skill.",
    selector: "CallExpression[callee.property.name=/^(catch|finally|then)$/]",
  },
  {
    // Banned outright (no Vue modifier exists for it, and it couples behavior to listener registration order).
    message:
      "stopImmediatePropagation is banned — it couples behavior to listener registration order. Restructure the handlers (or use @event.stop) instead.",
    selector: "CallExpression[callee.property.name='stopImmediatePropagation']",
  },
];
