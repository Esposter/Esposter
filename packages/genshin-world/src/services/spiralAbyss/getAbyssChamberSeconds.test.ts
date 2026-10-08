import {
  ABYSS_LONG_CLOCK_SECONDS,
  ABYSS_SHORT_CLOCK_LAST_FLOOR_INDEX,
  ABYSS_SHORT_CLOCK_SECONDS,
} from "#src/services/spiralAbyss/constants";
import { getAbyssChamberSeconds } from "#src/services/spiralAbyss/getAbyssChamberSeconds";
import { describe, expect, test } from "vitest";

describe(getAbyssChamberSeconds, () => {
  test("should give the short clock up to the last short-clock floor", () => {
    expect.hasAssertions();

    expect(getAbyssChamberSeconds(ABYSS_SHORT_CLOCK_LAST_FLOOR_INDEX)).toBe(ABYSS_SHORT_CLOCK_SECONDS);
  });

  test("should give the long clock from the floor after", () => {
    expect.hasAssertions();

    expect(getAbyssChamberSeconds(ABYSS_SHORT_CLOCK_LAST_FLOOR_INDEX + 1)).toBe(ABYSS_LONG_CLOCK_SECONDS);
  });
});
