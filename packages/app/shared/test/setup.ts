import { Environment } from "#shared/models/environment/Environment";
import { MOCK_BLOB_BASE_URL } from "azure-mock";
import { afterAll, vi } from "vitest";

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
