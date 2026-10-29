import { downsampleByMax } from "#src/services/genshinParity/probe/downsampleByMax";
import { describe, expect, test } from "vitest";

describe(downsampleByMax, () => {
  test("should keep the largest sample of each run once a profile is longer than its cap", () => {
    expect.hasAssertions();
    expect(downsampleByMax([1, 5, 2, 3], 2)).toStrictEqual([5, 3]);
  });

  test("should return a profile at or under its cap as it is", () => {
    expect.hasAssertions();
    expect(downsampleByMax([1, 5], 2)).toStrictEqual([1, 5]);
  });
});
