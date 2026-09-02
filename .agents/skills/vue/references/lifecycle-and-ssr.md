# Lifecycle hooks and the browser

Read when placing a lifecycle hook, or when a component reaches for a browser global that does not exist during SSR. This page holds the whole rule; `SKILL.md` keeps the declaration order the hooks sit in.

## Vue Hooks

- Place `watch`, `onMounted`, `onUnmounted` and other lifecycle hooks/watchers at the **bottom** of `<script setup>`, after all `const` assignments, with a blank line before them.
- **Prefer no hook at all** — exhaust the watch decision tree first. A hook that merely copies a store value into a local `ref` is almost always replaceable by the wrapper + pure-child pattern (`vue-component-patterns` skill): guard the source with `v-if` in the parent, pass it as a required prop, init the child's `ref` from that prop.
- **Blank line between each consecutive hook/watcher** — each is an independent registration. This overrides the `formatting` skill's "no blank line before a block that immediately follows another block".
- **Order by lifecycle phase** — `watch`/`watchEffect`, then `onMounted`, then `onUnmounted` (setup-time registrations precede mount-time, which precede teardown). Within a phase keep source order.
- Wrap the callback in an explicit arrow function — `onUnmounted(() => { reset(); })`, never `onUnmounted(reset)`. The rule is general to callbacks and owned by the `typescript` skill.

## Browser Globals and SSR

- **Prefix browser-only globals with `window.`** to make browser-only code explicit: `window.document.getElementById(id)`, `window.navigator.mediaDevices.getUserMedia(...)`, `new window.RTCPeerConnection(...)`, `window.requestAnimationFrame(cb)`. Standard built-ins available in all environments (`Uint8Array`, `Map`, `Set`, `JSON`, `Promise`, `crypto`, …) do **not** need it. Enforced by oxlint `no-restricted-globals`, so the list of which globals count lives in `.oxlintrc.json` rather than here.
  - **Tests are exempt**, and the rule is off for `**/*.test.ts`. A test declares the environment it runs in, and the default is node — `shared/test/setup.ts` loads `fake-indexeddb/auto`, which polyfills onto `globalThis` where there is no `window` at all, so a prefix there is a `ReferenceError` rather than a style improvement.
  - **`indexedDB` stays bare everywhere**, source included, and is deliberately absent from the restricted list. `services/cache/indexedDb/` is unit-tested in the node environment against that same polyfill, so prefixing the source breaks its own tests. It is the one browser global this repo treats as environment-agnostic.
- **Guard browser-only code with `checkIsServer()`** from `@esposter/shared` — never `import.meta.client` or `typeof window !== "undefined"`; `checkIsServer()` is consistent across Nuxt, shared packages and Azure Functions.

  ```typescript
  if (!checkIsServer()) { ... }

  useScript<typeof Desmos>(API_URL, {
    use: () => (checkIsServer() ? undefined : window.Desmos) as typeof Desmos,
  });
  ```
