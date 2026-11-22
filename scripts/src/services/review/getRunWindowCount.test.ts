import { REVIEW_RUN_WINDOW_CAP } from "#src/services/review/constants";
import { getRunWindowCount } from "#src/services/review/getRunWindowCount";
import { describe, expect, test } from "vitest";

describe(getRunWindowCount, () => {
  test("stretches past the cap through the first window main may move to", () => {
    expect.hasAssertions();

    const advanceables = [...Array.from({ length: REVIEW_RUN_WINDOW_CAP + 1 }, () => false), true, false];

    expect(getRunWindowCount(advanceables)).toBe(REVIEW_RUN_WINDOW_CAP + 2);
  });

  test("keeps the cap when an earlier window lets main move", () => {
    expect.hasAssertions();

    expect(getRunWindowCount([true, false, false, true])).toBe(REVIEW_RUN_WINDOW_CAP);
  });

  test("keeps the cap when no window lets main move", () => {
    expect.hasAssertions();

    expect(getRunWindowCount([false, false, false])).toBe(REVIEW_RUN_WINDOW_CAP);
  });
});
