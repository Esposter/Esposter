import { fetch, setup } from "@nuxt/test-utils";
import { beforeAll, describe, expect, test } from "vitest";

describe("App", async () => {
  beforeAll(() => {
    process.env.NUXT_AUTH_SECRET = "Secret";
  });

  await setup();

  test("loads about page", async () => {
    const { status } = await fetch("/about");
    expect(status).toBe(200);
  });
});
