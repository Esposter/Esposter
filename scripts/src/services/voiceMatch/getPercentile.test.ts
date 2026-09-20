import { getPercentile } from "#src/services/voiceMatch/getPercentile";
import { describe, expect, test } from "vitest";

describe(getPercentile, () => {
  const MEDIAN = 0.5;

  test("is not a number for no values", () => {
    expect.hasAssertions();

    expect(getPercentile([], MEDIAN)).toBeNaN();
  });

  test("reads the median off the sorted values, not the given order", () => {
    expect.hasAssertions();

    expect(getPercentile([1, -1, 0], MEDIAN)).toBe(0);
  });

  test("clamps the ends to the first and last values", () => {
    expect.hasAssertions();

    expect(getPercentile([0, 1], 0)).toBe(0);
    expect(getPercentile([0, 1], 1)).toBe(1);
  });
});
