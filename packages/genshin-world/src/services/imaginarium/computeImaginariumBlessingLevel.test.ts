import { computeImaginariumBlessingLevel } from "#src/services/imaginarium/computeImaginariumBlessingLevel";
import { describe, expect, test } from "vitest";

describe(computeImaginariumBlessingLevel, () => {
  const REQUIRED_COUNT = 2;

  test("should add two for each Alternate Cast member past the required count and one for each Brilliant Blessing level", () => {
    expect.hasAssertions();

    expect(computeImaginariumBlessingLevel(4, REQUIRED_COUNT, [1, 2])).toBe(7);
  });

  test("should add nothing for an Alternate Cast short of the required count", () => {
    expect.hasAssertions();

    expect(computeImaginariumBlessingLevel(1, REQUIRED_COUNT, [])).toBe(0);
  });
});
