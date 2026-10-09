import { getWindowOpenCount } from "#src/services/coderabbit/collect/getWindowOpenCount";
import { REVIEWS_PER_HOUR } from "#src/services/coderabbit/shared/constants";
import { describe, expect, test } from "vitest";

describe(getWindowOpenCount, () => {
  const REVIEWS_PER_HOUR_FIXTURE = 2;

  test.each([
    // Nothing open and nothing opened: the whole hourly ceiling is free
    [{ isStackingAllowed: false, openCount: 0, openedInLastHour: 0 }, REVIEWS_PER_HOUR_FIXTURE],
    // Nothing open, but the hour's openings have used the ceiling up
    [{ isStackingAllowed: false, openCount: 0, openedInLastHour: REVIEWS_PER_HOUR_FIXTURE }, 0],
    // Something open that the stack may not carry: nothing more opens
    [{ isStackingAllowed: false, openCount: 1, openedInLastHour: 0 }, 0],
    // Something open that the stack may carry: the room left is what the hour has left
    [{ isStackingAllowed: true, openCount: 1, openedInLastHour: 0 }, REVIEWS_PER_HOUR_FIXTURE],
    [{ isStackingAllowed: true, openCount: 0, openedInLastHour: 1 }, 1],
  ])("decides %o as %s more", (input, expected) => {
    expect.hasAssertions();

    expect(getWindowOpenCount({ ...input, reviewsPerHour: REVIEWS_PER_HOUR_FIXTURE })).toBe(expected);
  });

  // Each window spent its slot when it opened, so a slot the hour gives back is spent at once rather than once merges
  // Bring the open count down
  test("opens what the hour has left whatever the stack holds", () => {
    expect.hasAssertions();

    expect(
      getWindowOpenCount({
        isStackingAllowed: true,
        openCount: REVIEWS_PER_HOUR,
        openedInLastHour: 2,
        reviewsPerHour: REVIEWS_PER_HOUR,
      }),
    ).toBe(REVIEWS_PER_HOUR - 2);
  });
});
