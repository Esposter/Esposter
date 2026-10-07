import { computeMixBandDistance } from "#src/services/genshinAssets/music/computeMixBandDistance";
import { describe, expect, test } from "vitest";

describe(computeMixBandDistance, () => {
  test("reads each band's mean gap in decibels from the voices' scaled sum, under the floor as the floor", () => {
    expect.hasAssertions();

    const distance = computeMixBandDistance(
      [Float64Array.of(1, 0), Float64Array.of(4, 0)],
      [5, 1],
      Float64Array.of(0, 0),
      Float64Array.of(0.9, 1),
      [1, 1],
      1,
    );

    expect(distance).toBe(5);
  });

  test("counts the base beneath the voices", () => {
    expect.hasAssertions();

    expect(computeMixBandDistance([Float64Array.of(1)], [1], Float64Array.of(9), Float64Array.of(10), [1], 1)).toBe(0);
  });
});
