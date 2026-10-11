import { getWindowOpenCount } from "#src/services/coderabbit/collect/getWindowOpenCount";
import { describe, expect, test } from "vitest";

describe(getWindowOpenCount, () => {
  const OPEN_WINDOW_CAP_FIXTURE = 3;
  const REVIEWS_PER_HOUR_FIXTURE = 2;

  test.each([
    // Nothing open and nothing opened: the whole hourly ceiling is free
    [{ isStackingAllowed: false, openCount: 0, openedInLastHour: 0 }, REVIEWS_PER_HOUR_FIXTURE],
    // Nothing open, but the hour's openings have used the ceiling up
    [{ isStackingAllowed: false, openCount: 0, openedInLastHour: REVIEWS_PER_HOUR_FIXTURE }, 0],
    // Something open that the stack may not carry: nothing more opens
    [{ isStackingAllowed: false, openCount: 1, openedInLastHour: 0 }, 0],
    // Something open that the stack may carry: the room left is what the hour has left
    [{ isStackingAllowed: true, openCount: 1, openedInLastHour: 1 }, 1],
    // The stack has less room left under its cap than the hour has: the stack's room is what opens
    [{ isStackingAllowed: true, openCount: OPEN_WINDOW_CAP_FIXTURE - 1, openedInLastHour: 0 }, 1],
    // The stack at its cap opens nothing, whatever the hour has left
    [{ isStackingAllowed: true, openCount: OPEN_WINDOW_CAP_FIXTURE, openedInLastHour: 0 }, 0],
  ])("decides %o as %s more", (input, expected) => {
    expect.hasAssertions();

    expect(
      getWindowOpenCount({
        ...input,
        openWindowCap: OPEN_WINDOW_CAP_FIXTURE,
        reviewsPerHour: REVIEWS_PER_HOUR_FIXTURE,
      }),
    ).toBe(expected);
  });
});
