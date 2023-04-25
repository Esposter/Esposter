import { RoutePath } from "@/models/router/RoutePath";
import { fetch, setup } from "@nuxt/test-utils";
import { describe, expect, test } from "vitest";

describe("App", async () => {
  await setup();

  test("renders all non-dynamic pages", async () => {
    for (const route of Object.values(RoutePath)) {
      if (typeof route === "string" && route.startsWith("/")) {
        const response = await fetch(route);
        expect(response.status).toBe(200);
      }
    }
  });
});
