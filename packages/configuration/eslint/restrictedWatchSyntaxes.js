// `watchDeep(source, cb)` and `watchImmediate(source, cb)` say in the call what the option object says in a
// Trailing argument the reader has to scroll past, and the aliases compose (`watchDeep(source, cb, { immediate:
// True })` is the both-flags form), so the option is only ever an alias that was not reached for. The callee is
// Pinned to `watch` so those alias calls keep their own option objects.
// Spread into both the `**/*.ts` and `**/*.vue` overrides: a `watch` lives in a store or a composable as often
// As in a component.
// The aliases are VueUse via Nuxt auto-imports, so `packages/vue-phaserjs` — the other consumer of the Vue
// Config — cannot reach them without taking VueUse on as a published dependency, and disables that one site.
export default [
  {
    message:
      "Use `watchDeep(source, cb)` over `watch(source, cb, { deep: true })` and `watchImmediate` over `{ immediate: true }`. See the vue skill.",
    selector:
      "CallExpression[callee.name='watch'] > ObjectExpression > Property[key.name=/^(deep|immediate)$/][value.value=true]",
  },
  {
    // An effect tracks whatever its body happens to read, so what re-runs it is only found by reading every branch,
    // And a read added later for another reason silently becomes a trigger. A `watch` names its sources.
    message:
      '`watchEffect` is banned — use `watch` (or `watchImmediate`) with explicit sources, and `{ flush: "post" }` for the post-render timing. See the vue skill.',
    selector: "CallExpression[callee.name=/^(watchEffect|watchPostEffect|watchSyncEffect)$/]",
  },
];
