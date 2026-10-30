import { checkIsPageStale } from "#src/services/genshinParity/page/checkIsPageStale";
import { describe, expect, test } from "vitest";

describe(checkIsPageStale, () => {
  test("should be stale once a build finishes after the page started, and current while every build predates it", () => {
    expect.hasAssertions();

    const STARTED_AT = 100;
    const BUILT_BEFORE = 50;
    const BUILT_AFTER = 150;

    expect(checkIsPageStale(STARTED_AT, [BUILT_BEFORE, BUILT_AFTER])).toBe(true);
    expect(checkIsPageStale(STARTED_AT, [BUILT_BEFORE])).toBe(false);
    expect(checkIsPageStale(STARTED_AT, [])).toBe(false);
  });
});
