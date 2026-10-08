import { getWindowOpenCount } from "#src/services/coderabbit/collect/getWindowOpenCount";
import { describe, expect, test } from "vitest";

const REVIEWS_PER_HOUR_FIXTURE = 2;

describe(getWindowOpenCount, () => {
  test.each([
    // Nothing open and nothing opened: the whole hourly ceiling is free
    [{ isStackingAllowed: false, openCount: 0, openedInLastHour: 0 }, REVIEWS_PER_HOUR_FIXTURE],
    // Nothing open, but the hour's openings have used the ceiling up
    [{ isStackingAllowed: false, openCount: 0, openedInLastHour: REVIEWS_PER_HOUR_FIXTURE }, 0],
    // Something open that the stack may not carry: nothing more opens
    [{ isStackingAllowed: false, openCount: 1, openedInLastHour: 0 }, 0],
    // Something open that the stack may carry: the room left is the lesser of the two counts
    [{ isStackingAllowed: true, openCount: 1, openedInLastHour: 0 }, 1],
    [{ isStackingAllowed: true, openCount: 0, openedInLastHour: 1 }, 1],
    // The open count is at the ceiling
    [{ isStackingAllowed: true, openCount: REVIEWS_PER_HOUR_FIXTURE, openedInLastHour: 0 }, 0],
  ])("decides %o as %s more", (input, expected) => {
    expect.hasAssertions();

    expect(getWindowOpenCount({ ...input, reviewsPerHour: REVIEWS_PER_HOUR_FIXTURE })).toBe(expected);
  });
});
