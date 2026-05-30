import { Environment } from "#shared/models/environment/Environment";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { MOCK_BLOB_BASE_URL } from "azure-mock";
import { afterAll, beforeAll, vi } from "vitest";

vi.mock("@@/server/composables/useIsProduction", () => ({
  useIsProduction: () => false,
}));

vi.mock("@@/server/composables/azure/container/useContainerBaseUrl", () => ({
  useContainerBaseUrl: () => MOCK_BLOB_BASE_URL,
}));

vi.mock("nitro/runtime", () => ({
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

beforeAll(() => {
  GlobalRegistrator.register({
    height: 1080,
    url: "http://localhost:3000",
    width: 1920,
  });
  if (!document.getElementById("__nuxt")) {
    const nuxtElement = document.createElement("div");
    nuxtElement.id = "__nuxt";
    document.body.appendChild(nuxtElement);
  }
});

afterAll(async () => {
  await GlobalRegistrator.unregister();
  vi.restoreAllMocks();
});
