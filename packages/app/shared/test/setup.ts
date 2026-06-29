import { Environment } from "#shared/models/environment/Environment";
import { getIsServer } from "@esposter/shared";
import { MOCK_BLOB_BASE_URL } from "azure-mock";
import { afterAll, afterEach, beforeEach, vi } from "vitest";
// The nuxt test env provides `window`/`document`/`DOMParser` but not `localStorage`/`sessionStorage`,
// So install a minimal in-memory `Storage` — cheaper than registering a full DOM, harmless in node.
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

globalThis.localStorage = new MemoryStorage();
globalThis.sessionStorage = new MemoryStorage();

vi.mock(import("@@/server/composables/azure/container/useContainerBaseUrl"), () => ({
  useContainerBaseUrl: () => MOCK_BLOB_BASE_URL,
}));

vi.mock("nitropack/runtime", () => ({
  useRuntimeConfig: () => ({
    public: {
      appEnv: Environment.development,
      azure: {
        container: {
          baseUrl: MOCK_BLOB_BASE_URL,
        },
      },
    },
  }),
}));
// The first mountSuspended in a worker pays a one-time cold cost: the Nuxt app graph is evaluated and its
// Plugins applied on first mount. Charged inside a test body it can blow the per-test timeout — especially
// Under virrun on win32, where the sandbox reads repo source through WSL's /mnt/c (v9fs) and those cold
// First-reads are 15-64x slower. Warm it once per worker so that cost lands in a hook (billed to the generous
// HookTimeout, not a test's testTimeout), keeping per-test timings honest — written once here for every file
// Rather than duplicated per file. It must be a beforeEach, not a beforeAll: the nuxt env registers its own
// `beforeAll(setupNuxt)` after this setup file, and beforeAll order is registration order, so a beforeAll here
// Runs before the app is built; every beforeEach runs after all beforeAlls, so the app is ready by then. The
// Module-scoped flag makes it fire only on the first test of the worker, no-op thereafter. Node-env files
// (`getIsServer()` — no `window`) skip it — they never mount, and importing the nuxt runtime there would break them.
let isNuxtRuntimeWarm = false;
if (!getIsServer())
  beforeEach(async () => {
    if (isNuxtRuntimeWarm) return;
    isNuxtRuntimeWarm = true;
    const [{ mountSuspended }, { defineComponent, h }] = await Promise.all([
      import("@nuxt/test-utils/runtime"),
      import("vue"),
    ]);
    (await mountSuspended(defineComponent({ render: () => h("div") }))).unmount();
  });

afterEach(() => {
  globalThis.localStorage.clear();
  globalThis.sessionStorage.clear();
});

afterAll(() => {
  vi.restoreAllMocks();
});
