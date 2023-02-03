import { fetch, setup } from "@nuxt/test-utils";
import { describe, expect, test } from "vitest";

describe("App", async () => {
  await setup();

  test("loads", async () => {
    const { status } = await fetch("/");
    expect(status).toBe(200);
  });
});
