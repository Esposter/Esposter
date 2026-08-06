# Test Environment and Component Mounting

For tests that need a DOM, the nuxt runtime, a mounted component, or that dispatch events.

## Environment

**Every package defaults to the `node` environment**, including `packages/app`. `defineVitestProject` (`@nuxt/test-utils/config`) hardcodes `test.environment = "nuxt"` for the whole project, so `packages/app/vitest.config.ts` explicitly resets it to `"node"` after the call — `defineVitestProject` is just `resolveConfig` (all the nuxt wiring: plugins, aliases, runtime entry setup file, environmentOptions) plus that one hardcode, so the reset restores the pre-`projects`-migration `defineVitestConfig` semantics: node by default, per-file `// @vitest-environment nuxt` directives opt into the nuxt environment (the wiring stays intact, so the directive resolves).

The `// @vitest-environment nuxt` directives are **load-bearing** — never remove one without moving the test off nuxt-runtime features.

- **No directive = no DOM.** A directive-less app test runs in node: no `window`, `getIsServer()` returns `true`. To exercise a **client** path in a node-env test, stub it: `vi.stubGlobal("window", {})`; server path in any env: `vi.stubGlobal("window", undefined)` (+ `vi.unstubAllGlobals()` in `afterEach`). Prefer env-agnostic stubbing over relying on the ambient environment when the code branches on `getIsServer()`.
- **Add `// @vitest-environment nuxt` only when the test needs the nuxt runtime**: `mountSuspended`/`renderSuspended` from `@nuxt/test-utils/runtime`, or stores/composables calling `useNuxtApp()`/`useRouter()` at setup time. Apply the criteria; don't copy another file because it has the directive.
- tRPC router tests stay node-env: `createCallerFactory` is pure `@trpc/server`, and Nuxt-dependent server composables hit by middleware (e.g. `useIsProduction` → `useRuntimeConfig`) are mocked in `shared/test/setup.ts`.

**DOM comes from the nuxt environment, not setup.ts.** The nuxt environment builds its own happy-dom `window`/`document` (and `mountSuspended` attaches to its own `#test-wrapper`), so there is **no** manual happy-dom registration. `fake-indexeddb/auto` stays a global setup file: it only assigns the IDB\* global constructors the `idb` library needs, and the cache composables (`useCursorPaginationCache`/`useOffsetPaginationCache`) pull IndexedDB in transitively across many tests, so scoping it isn't worth the surface area.

## Composables with lifecycle hooks

Use `mountSuspended` from `@nuxt/test-utils/runtime` with a minimal wrapper when `onMounted`/`onUnmounted` are needed:

```ts
describe(useMyComposable, () => {
  let wrapper: VueWrapper;
  const mountComposable = async () => {
    wrapper = await mountSuspended(defineComponent({ render: () => h("div"), setup: () => useMyComposable() }));
  };
  afterEach(() => wrapper?.unmount());
  // each test: await mountComposable(); then await flushPromises();
});
```

## A dispatched event whose handler is async leaves a promise nobody holds

`element.dispatchEvent(e)` returns a `boolean`, so an `async` handler behind it — a template `@click` that awaits `navigateTo`, a mutation, any `await` at all — settles after the environment is torn down, and the run dies as a `statusCode: 500` attributed to whichever file was unlucky. Assertions on the event itself (`defaultPrevented`) are set synchronously during bubbling, so nothing you assert on depends on that promise — the only question is where it lands.

- **In-process work: `await flushPromises()`** between the dispatch and the assertion. Enough for anything that stays in microtasks — a store write, a mocked mutation.
- **A real navigation: stub it, don't wait for it.** `navigateTo` resolves route middleware through a dynamic import served by Vite's module runner — real I/O, not microtasks — so `flushPromises()` returns long before it lands and the load hits a dead environment (`EnvironmentTeardownError: Cannot load '/app/middleware/guest.ts' … after the environment was torn down`). Awaiting harder cannot fix it; a test that asserts on the row's cancelled default has no stake in the destination, so take the router out of the picture at file scope (hoisted, so once per file):

```ts
mockNuxtImport("navigateTo", () => vi.fn<typeof navigateTo>());
```

`typescript/no-floating-promises` will not save you here — it sees `dispatchEvent`'s `boolean`, not the handler Vue invokes — though it does cover the forms written directly in a test (a bare `navigateTo(...)`, an un-awaited `.trigger()`). Vitest exits `1` on an unhandled error even when every test passes, so this does fail the build; it fails it **intermittently**, since the promise only loses the race when teardown is prompt. A suite that passes alone and fails in the full run is this shape until proven otherwise.
