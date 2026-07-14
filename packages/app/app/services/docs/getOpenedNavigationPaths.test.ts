import { getOpenedNavigationPaths } from "@/services/docs/getOpenedNavigationPaths";
import { RoutePath } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getOpenedNavigationPaths, () => {
  test("returns every ancestor path below the docs root", () => {
    expect.hasAssertions();

    expect(getOpenedNavigationPaths(`${RoutePath.Docs}/a/b/c`)).toStrictEqual([
      `${RoutePath.Docs}/a`,
      `${RoutePath.Docs}/a/b`,
      `${RoutePath.Docs}/a/b/c`,
    ]);
  });

  test("returns empty array for the docs root", () => {
    expect.hasAssertions();

    expect(getOpenedNavigationPaths(RoutePath.Docs)).toStrictEqual([]);
  });
});
