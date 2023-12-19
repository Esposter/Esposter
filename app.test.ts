// @vitest-environment node
import { RoutePath } from "@/models/router/RoutePath";
import { fetch, setup } from "@nuxt/test-utils/e2e";
import { describe, expect, test } from "vitest";

describe("App", async () => {
  await setup({
    setupTimeout: 5 * 60 * 10000,
  });
  // Let's just test about page for now as it doesn't do any trpc requests
  // We can consider trying to mock trpc with msw-trpc and test all
  // non-dynamic pages in the future
  test("renders about page", async () => {
    for (const route of Object.values(RoutePath))
      if (typeof route === "string" && route.startsWith("/") && route === RoutePath.About) {
        const response = await fetch(route);
        expect(response.status).toBe(200);
      }
  });
});
