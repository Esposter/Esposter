import { isPageStale } from "#src/services/genshinParity/page/isPageStale";
import { describe, expect, test } from "vitest";

describe(isPageStale, () => {
  test("should be stale once a build finishes after the page started, and current while every build predates it", () => {
    expect.hasAssertions();

    const STARTED_AT = 100;
    const BUILT_BEFORE = 50;
    const BUILT_AFTER = 150;

    expect(isPageStale(STARTED_AT, [BUILT_BEFORE, BUILT_AFTER])).toBe(true);
    expect(isPageStale(STARTED_AT, [BUILT_BEFORE])).toBe(false);
    expect(isPageStale(STARTED_AT, [])).toBe(false);
  });
});
