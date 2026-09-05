# Test Environment and Component Mounting

For tests that need a DOM, the nuxt runtime, a mounted component, or that dispatch events.

## Environment

**Every package defaults to the `node` environment**, including `packages/app`. `defineVitestProject` (`@nuxt/test-utils/config`) hardcodes `test.environment = "nuxt"` for the whole project, so `packages/app/vitest.config.ts` explicitly resets it to `"node"` after the call — `defineVitestProject` is just `resolveConfig` (all the nuxt wiring: plugins, aliases, runtime entry setup file, environmentOptions) plus that one hardcode, so the reset restores the pre-`projects`-migration `defineVitestConfig` semantics: node by default, per-file `// @vitest-environment nuxt` directives opt into the nuxt environment (the wiring stays intact, so the directive resolves).

The `// @vitest-environment nuxt` directives are **load-bearing** — never remove one without moving the test off nuxt-runtime features.

- **No directive = no DOM.** A directive-less app test runs in node: no `window`, `checkIsServer()` returns `true`. To exercise a **client** path in a node-env test, stub it: `vi.stubGlobal("window", {})`; server path in any env: `vi.stubGlobal("window", undefined)` (+ `vi.unstubAllGlobals()` in `afterEach`). Prefer env-agnostic stubbing over relying on the ambient environment when the code branches on `checkIsServer()`.
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

## `mountSuspended` stubs `RouterLink`, so link-active assertions pass vacuously

The mount helper overrides the app's global `RouterLink` with its own component that has no static `useLink`. Anything deriving state from the link — Vuetify's `v-btn`/`v-tab` highlighting above all — then takes its no-router branch: no `href`, never active, so an assertion that the wrong element is _not_ highlighted holds no matter what the component does. Pass the real component back in; `global.components` wins over the helper's defaults:

```ts
import { RouterLink } from "vue-router";

await mountSuspended(Foo, { global: { components: { RouterLink } }, props, route: "/docs/architecture" });
```

The `route` option resolves against the app's real routes, so route matching (params, catch-alls) behaves exactly as it does in the browser.

A `v-btn` that resolved the link renders as an `<a>`; one that never saw the router stays a `<button>`. That tag
is therefore the assertion that the real component was passed back in — `toBe("A")` fails against the stub.

## A mounted component's store is the nuxt app's pinia — resolve it after the mount

`mountSuspended` mounts into the nuxt app's own pinia, so a `useFooStore()` called before it — or after a
`createPinia()` of the test's own — hands back a different instance from the one the component injected. Seeding
that one changes nothing on screen and every assertion against it passes vacuously. Resolve the store after the
mount and seed it there, the same ordering `setCurrentRoomId` needs below and for the same reason.

```ts
const wrapper = await mountSuspended(Foo);
const fooStore = useFooStore();
fooStore.bar = value;
await nextTick();
```

## A room-scoped store has no state until a room is current — `setCurrentRoomId`

Every room-scoped store keys its state by the room id in the route, so before one is set the store's maps are empty and any assertion against them passes vacuously. Two things make the obvious assignment silently do nothing, which is why this is a shared helper (`app/services/message/room/setCurrentRoomId.test.ts`) rather than a line each test writes:

- **Mounting resets the route**, so the id has to be set _after_ `mountSuspended`, not in a `beforeEach` above it.
- **`router.currentRoute` is a `shallowRef`**, so writing `params.id` into the existing params object mutates a value nothing is tracking. The helper's `triggerRef` is what makes the computed re-read.

```ts
const wrapper = await mountSuspended(Foo);
setCurrentRoomId(roomId); // after the mount, and never a bare `currentRoute.value.params.id = roomId`
```

## A dispatched event whose handler is async leaves a promise nobody holds

`element.dispatchEvent(e)` returns a `boolean`, so an `async` handler behind it — a template `@click` that awaits `navigateTo`, a mutation, any `await` at all — settles after the environment is torn down, and the run dies as a `statusCode: 500` attributed to whichever file was unlucky. Assertions on the event itself (`defaultPrevented`) are set synchronously during bubbling, so nothing you assert on depends on that promise — the only question is where it lands.

- **In-process work: `await flushPromises()`** between the dispatch and the assertion. Enough for anything that stays in microtasks — a store write, a mocked mutation.
- **A real navigation: stub it, don't wait for it.** `navigateTo` resolves route middleware through a dynamic import served by Vite's module runner — real I/O, not microtasks — so `flushPromises()` returns long before it lands and the load hits a dead environment (`EnvironmentTeardownError: Cannot load '/app/middleware/guest.ts' … after the environment was torn down`). Awaiting harder cannot fix it; a test that asserts on the row's cancelled default has no stake in the destination, so take the router out of the picture at file scope (hoisted, so once per file):

```ts
mockNuxtImport("navigateTo", () => vi.fn<typeof navigateTo>());
```

`typescript/no-floating-promises` will not save you here — it sees `dispatchEvent`'s `boolean`, not the handler Vue invokes — though it does cover the forms written directly in a test (a bare `navigateTo(...)`, an un-awaited `.trigger()`). Vitest exits `1` on an unhandled error even when every test passes, so this does fail the build; it fails it **intermittently**, since the promise only loses the race when teardown is prompt. A suite that passes alone and fails in the full run is this shape until proven otherwise.
