import { RoutePath } from "@/models/router";
import { read, setup } from "@nuxt/test-utils";
import { beforeAll, describe, expect, test } from "vitest";

describe("App", async () => {
  beforeAll(() => {
    process.env.NUXT_AUTH_SECRET = "Secret";
  });

  await setup();

  test("renders about page", async () => {
    const { status } = await read(RoutePath.About);
    expect(status).toBe(200);
  });
});
