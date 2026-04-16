import { Environment } from "#shared/models/environment/Environment";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterAll, beforeAll, vi } from "vitest";

beforeAll(() => {
  GlobalRegistrator.register({
    height: 1080,
    url: "http://localhost:3000",
    width: 1920,
  });
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
});

afterAll(async () => {
  await GlobalRegistrator.unregister();
  vi.restoreAllMocks();
});
