import { getSupersessionCacheKey } from "#src/services/outdatedDependencies/supersession/getSupersessionCacheKey";
import { describe, expect, test } from "vitest";

describe(getSupersessionCacheKey, () => {
  test("keys a verdict by its package name and locked version", () => {
    expect.hasAssertions();

    expect(getSupersessionCacheKey("@codemirror/lang-vue", "6.0.0")).toBe("@codemirror/lang-vue@6.0.0");
  });

  test("keys the same package at another version apart", () => {
    expect.hasAssertions();

    expect(getSupersessionCacheKey("superjson", "2.0.0")).not.toBe(getSupersessionCacheKey("superjson", "2.0.1"));
  });
});
