/* eslint-disable no-restricted-syntax -- an empty constructor shares no members with the real one, so no single cast is accepted; the dungeon page passes it to Phaser only as a plugin; only a client-env file loads @vue/test-utils, so the import sits behind the client guard and a node-env file never pulls it in */
/* oxlint-disable no-underscore-dangle -- marker property name is owned by @nuxt/test-utils; Pinia's store registry has no public accessor, and `$dispose` removes each entry */
import type { Pinia } from "pinia";

import { MOCK_ENVIRONMENT_VARIABLES } from "#shared/services/environment/constants.test";
import { checkIsServer } from "@esposter/shared";
import { afterAll, afterEach, beforeEach, vi } from "vitest";

// The node environment has no storage at all: the shared Vitest configuration switches node's own Web Storage
// Off, so the `afterEach` clear below — which every file here runs, whichever environment it is in — would die
// On the missing global. The nuxt environment needs nothing: happy-dom's own working `Storage`
// Lands on the global, so the assignment is **guarded** rather than unconditional. Assigning over it
// Would throw `Cannot set property localStorage of #<GlobalWindow> which has only a getter`, because a DOM
// Global assigned here reaches the window itself, and take down every suite in the environment at load.
class MemoryStorage implements Storage {
  get length() {
    return this.#store.size;
  }

  readonly #store = new Map<string, string>();

  clear() {
    this.#store.clear();
  }

  getItem(key: string) {
    return this.#store.get(key) ?? null;
  }

  key(index: number) {
    return [...this.#store.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.#store.delete(key);
  }

  setItem(key: string, value: string) {
    this.#store.set(key, value);
  }
}

globalThis.localStorage ??= new MemoryStorage();
globalThis.sessionStorage ??= new MemoryStorage();
// The Scheduler client redirects to its colocated in-memory double, here rather than in `context.test.ts`: a `vi.mock`
// Is hoisted only within the file that writes it, so one registered from an imported module never intercepts a test
// File's OWN direct import of the same composable. A setup file runs before the test module is imported, so
// Registering once here covers both. The factory is lazy, so a test that touches no scheduler pays nothing.
vi.mock(import("#server/services/queue/getJobQueue"), () => import("#server/services/queue/getJobQueue.test"));

vi.mock(
  import("#server/composables/scheduler/useScheduler"),
  () => import("#server/composables/scheduler/useScheduler.test"),
);

// A bucket binding is read through the Worker's env, which Node does not have. Its buckets are made by the suite that
// Uses them, into the mock's own record, so the read stays synchronous as the binding is
vi.mock(import("#server/services/storage/getBucket"), () => import("#server/services/storage/getBucket.test"));
// The better-auth session is registered here rather than beside the context helpers: it reached a suite only when that
// Module happened to load before the suite's router did.
vi.mock(import("#server/auth"), () => import("#server/auth.test"));
// The dungeon page passes GridEngine to Phaser only as a plugin, so an empty constructor stands in for it
const EmptyGridEngine = function () {};
// `grid-engine` re-exports Phaser, which touches `window` and a canvas context at import. Every dungeon suite that
// Reaches its grid-engine exports through a module needs only those, so they are registered once here rather than per file
vi.mock(import("grid-engine"), () => ({
  // oxlint-disable typescript/no-unsafe-enum-assignment -- the stubs restate grid-engine's enums as plain values, because importing the real enums loads Phaser, which touches window
  Direction: {
    DOWN: "down",
    DOWN_LEFT: "down-left",
    DOWN_RIGHT: "down-right",
    LEFT: "left",
    NONE: "none",
    RIGHT: "right",
    UP: "up",
    UP_LEFT: "up-left",
    UP_RIGHT: "up-right",
  } as typeof import("grid-engine").Direction,
  GridEngine: EmptyGridEngine as unknown as typeof import("grid-engine").GridEngine,
  NumberOfDirections: { EIGHT: 8, FOUR: 4 } as typeof import("grid-engine").NumberOfDirections,
  // oxlint-enable typescript/no-unsafe-enum-assignment
}));
// oxlint-disable-next-line vitest/prefer-import-in-mock -- the stubbed `useRuntimeConfig` returns a fraction of the config, which the typed `import()` form holds to the real return type
vi.mock("nuxt/server", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useRuntimeConfig: () => ({
    // Nuxt's generated `#internal/nuxt/paths` reads `useRuntimeConfig().app.baseURL` at module scope
    // (via `#build/fetch`'s eager `$fetch.create`), so the mock must carry the standard `app` defaults.
    app: { baseURL: "/", buildAssetsDir: "/_nuxt/", cdnURL: "" },
    public: { assets: { baseUrl: "https://assets.example.com" } },
  }),
}));
// The first mountSuspended in a worker pays a one-time cold cost: the Nuxt app graph is evaluated and its
// Plugins applied on first mount. Charged inside a test body it can blow the per-test timeout. Warm it once per
// Worker so that cost lands in a hook (billed to the generous
// `hookTimeout`, not a test's testTimeout), keeping per-test timings honest — written once here for every file
// Rather than duplicated per file. It must be a beforeEach, not a beforeAll: the nuxt env registers its own
// `beforeAll(setupNuxt)` after this setup file, and beforeAll order is registration order, so a beforeAll here
// Runs before the app is built; every beforeEach runs after all beforeAlls, so the app is ready by then. The
// Module-scoped flag keeps the warm-up to the first test of the worker. Node-env files
// (`checkIsServer()` — no `window`) skip it — they never mount, and importing the nuxt runtime there would break them.
// Plain happy-dom files (a `window` but no Nuxt app) skip it via the env's own marker — mounting there would crash.
let isNuxtRuntimeWarm = false;
if (!checkIsServer() && (window as { __NUXT_VITEST_ENVIRONMENT__?: true }).__NUXT_VITEST_ENVIRONMENT__)
  beforeEach(async () => {
    const [{ mountSuspended }, { useNuxtApp, useRouter }, { setActivePinia }, { defineComponent, h }] =
      await Promise.all([import("@nuxt/test-utils/runtime"), import("nuxt/app"), import("pinia"), import("vue")]);
    if (!isNuxtRuntimeWarm) {
      isNuxtRuntimeWarm = true;
      (await mountSuspended(defineComponent({ render: () => h("div") }))).unmount();
      // The app's initial navigation settles on its own schedule and replaces the route when it lands, so a suite that
      // Writes route params before then loses them to it — the first test's reads, whenever an answer arrives later
      // Than that navigation, find no route id. Waiting for it here puts every test after it
      await useRouter().isReady();
    }
    // One Pinia per environment — the app's own, emptied before every test. Every store action re-activates the Pinia
    // Its store belongs to, and the app calls actions on its own stores whenever it likes (a plugin's head-render or
    // `afterEach` hook), so a suite holding a second Pinia of its own reads the app's from that moment on.
    // `@pinia/nuxt` types `$pinia` only for the app's own tsconfig, so `shared/` reads it as `unknown`
    const $pinia = useNuxtApp().$pinia as Pinia;
    for (const store of $pinia._s.values()) store.$dispose();
    $pinia.state.value = {};
    setActivePinia($pinia);
  });

// A component a test mounts is unmounted after it, so nothing it teleported, listened to or scheduled reaches the next
// Test. A test's own `unmount()` is left only where unmounting is what it checks. Node-env files never mount
if (!checkIsServer()) {
  const { enableAutoUnmount } = await import("@vue/test-utils");
  enableAutoUnmount(afterEach);
}

// Stubbed before every test rather than once, since the config restores every stubbed variable after each one. A test
// That needs a variable different, or absent, stubs it itself after this runs
// oxlint-disable-next-line vitest/no-duplicate-hooks -- the nuxt environment's hook above is registered only inside its own guard, so this one cannot join it
beforeEach(() => {
  for (const [name, value] of Object.entries(MOCK_ENVIRONMENT_VARIABLES)) vi.stubEnv(name, value);
});

afterEach(() => {
  globalThis.localStorage.clear();
  globalThis.sessionStorage.clear();
});

afterAll(() => {
  vi.restoreAllMocks();
});
