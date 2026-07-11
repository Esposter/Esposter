import { getOpenedNavigationPaths } from "@/services/docs/getOpenedNavigationPaths";
import { describe, expect, test } from "vitest";

describe(getOpenedNavigationPaths, () => {
  test("returns every ancestor path below the docs root", () => {
    expect.hasAssertions();

    expect(getOpenedNavigationPaths("/docs/esbabbler/calls/call-view")).toStrictEqual([
      "/docs/esbabbler",
      "/docs/esbabbler/calls",
      "/docs/esbabbler/calls/call-view",
    ]);
  });

  test("returns empty array for the docs root", () => {
    expect.hasAssertions();

    expect(getOpenedNavigationPaths("/docs")).toStrictEqual([]);
  });
});
