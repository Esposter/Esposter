import { Environment } from "#shared/models/environment/Environment";
import { MOCK_BLOB_BASE_URL } from "azure-mock";
import { afterAll, afterEach, vi } from "vitest";
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

vi.mock("@@/server/composables/azure/container/useContainerBaseUrl", () => ({
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

afterEach(() => {
  globalThis.localStorage.clear();
  globalThis.sessionStorage.clear();
});

afterAll(() => {
  vi.restoreAllMocks();
});
