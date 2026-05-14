import { Environment } from "#shared/models/environment/Environment";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterAll, beforeAll, vi } from "vitest";

vi.mock("nitropack/runtime", () => ({
  useRuntimeConfig: () => ({
    public: {
      appEnv: Environment.development,
      azure: {
        container: {
          baseUrl: "https://mockaccount.blob.core.windows.net",
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
