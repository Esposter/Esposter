import { readMixBandDistance } from "#src/services/genshinAssets/music/readMixBandDistance";
import { describe, expect, test } from "vitest";

describe(readMixBandDistance, () => {
  test("reads each band's mean gap in decibels from the voices' scaled sum, under the floor as the floor", () => {
    expect.hasAssertions();

    const distance = readMixBandDistance(
      [Float64Array.of(1, 0), Float64Array.of(4, 0)],
      [5, 1],
      Float64Array.of(0.9, 1),
      [1, 1],
      1,
    );

    expect(distance).toBe(5);
  });
});
