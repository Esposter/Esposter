# What Earns a Composable

Read when a composable is about to be written, or reviewed for whether it should exist and what it returns. The one-line rules are in `SKILL.md`; this page is their full statement.

- **A composable that only re-exposes something is not a composable — delete it.** `useFoo()` whose body is `storeToRefs(useFooStore())`, a single `computed` over one store ref, or a rename of one import buys nothing and costs a layer: the consumer can no longer see where the state lives, the store's own methods are invisible from the call site, and every new field has to be threaded through the wrapper. Use the store directly (`pinia` skill's ordering rules apply). A composable earns its file only when it **composes**: it owns local reactive state, sequences async work, wires a lifecycle hook, or joins two or more sources into something neither provides.

- **Minimal public surface** — return only the composed operations callers actually use; bookkeeping helpers stay internal. If every caller would pair two returned functions the same way (e.g. assign + a snapshot reset), return the composed function (`setState`) instead of the parts.

- **Single-function composables return the function directly** — `return async (...) => { ... }`. Callers use `const fn = useX()` not `const { fn } = useX()`.
