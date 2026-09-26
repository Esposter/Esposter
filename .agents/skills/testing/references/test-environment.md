# The Test Environment

Read when a test needs a DOM or the nuxt runtime, or a composable under test registers lifecycle hooks.

## `node` by default, `nuxt` by directive

**Every package defaults to the `node` environment**, including `apps/web`. `defineVitestProject` (`@nuxt/test-utils/config`) hardcodes `test.environment = "nuxt"` for the whole project, so `apps/web/vitest.config.ts` explicitly resets it to `"node"` after the call — `defineVitestProject` is just `resolveConfig` (all the nuxt wiring: plugins, aliases, runtime entry setup file, environmentOptions) plus that one hardcode, so the reset restores the pre-`projects`-migration `defineVitestConfig` semantics: node by default, per-file `// @vitest-environment nuxt` directives opt into the nuxt environment (the wiring stays intact, so the directive resolves).

The `// @vitest-environment nuxt` directives are **load-bearing** — never remove one without moving the test off nuxt-runtime features.

- **No directive = no DOM.** A directive-less app test runs in node: no `window`, `checkIsServer()` returns `true`. To exercise a **client** path in a node-env test, stub it: `vi.stubGlobal("window", {})`; server path in any env: `vi.stubGlobal("window", undefined)` (+ `vi.unstubAllGlobals()` in `afterEach`). Prefer env-agnostic stubbing over relying on the ambient environment when the code branches on `checkIsServer()`.
- **Add `// @vitest-environment nuxt` only when the test needs the nuxt runtime**: `mountSuspended`/`renderSuspended` from `@nuxt/test-utils/runtime`, or stores/composables calling `useNuxtApp()`/`useRouter()` at setup time. Apply the criteria; don't copy another file because it has the directive.
- tRPC router tests stay node-env: `createCallerFactory` is pure `@trpc/server`, and the Nitro runtime a middleware reaches (`useRuntimeConfig`) is mocked in `shared/test/setup.ts`.

**DOM comes from the nuxt environment, not setup.ts.** The nuxt environment builds its own happy-dom `window`/`document` (and `mountSuspended` attaches to its own `#test-wrapper`), so there is **no** manual happy-dom registration. `fake-indexeddb/auto` stays a global setup file: it only assigns the IDB\* global constructors the `idb` library needs, and the cache composables (`useCursorPaginationCache`/`useOffsetPaginationCache`) pull IndexedDB in transitively across many tests, so scoping it isn't worth the surface area.

## Composables with lifecycle hooks

Use `mountSuspended` from `@nuxt/test-utils/runtime` with a minimal wrapper when `onMounted`/`onUnmounted` are needed:

```ts
describe(useMyComposable, () => {
  const mountComposable = () =>
    mountSuspended(defineComponent({ render: () => h("div"), setup: () => useMyComposable() }));
  // each test: await mountComposable(); then await flushPromises();
});
```

The shared setup unmounts it after the test (`references/nuxt-environment-and-mounting.md`), so the suite keeps no wrapper for teardown.
