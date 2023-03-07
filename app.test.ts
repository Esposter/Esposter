import { RoutePath } from "@/models/router/RoutePath";
import { fetch, setup } from "@nuxt/test-utils";
import { beforeAll, describe, expect, test } from "vitest";

describe("App", async () => {
  beforeAll(() => {
    process.env.NUXT_AUTH_SECRET = "Secret";
  });

  await setup();

  test("renders about page", async () => {
    const { status } = await fetch(RoutePath.About);
    expect(status).toBe(200);
  });
});
