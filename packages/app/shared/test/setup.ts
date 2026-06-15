import { Environment } from "#shared/models/environment/Environment";
import { MOCK_BLOB_BASE_URL } from "azure-mock";
import { afterAll, vi } from "vitest";
// The nuxt test environment builds its own happy-dom `window`/`document`/`DOMParser`, but it does
// Not expose `localStorage`/`sessionStorage` (not even on `window`). They were previously provided
// By happy-dom's `GlobalRegistrator`; with that removed we install a minimal in-memory `Storage`
// Instead — far cheaper than registering a full DOM, and harmless in the node environment.
class MemoryStorage implements Storage {
  readonly #store = new Map<string, string>();

  get length() {
    return this.#store.size;
  }

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

afterAll(() => {
  vi.restoreAllMocks();
});
