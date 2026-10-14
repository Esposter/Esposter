import { averageSurfaceDetails } from "#src/services/genshinAssets/fit/averageSurfaceDetails";
import { describe, expect, test } from "vitest";

describe(averageSurfaceDetails, () => {
  test("averages each band, the texel size and the variance over the details it is given, each weighted by its area", () => {
    expect.hasAssertions();
    expect(
      averageSurfaceDetails([
        { detail: { bands: [1, 2], metresPerTexel: 1, variance: 4 }, weight: 3 },
        { detail: { bands: [5, 6], metresPerTexel: 5, variance: 0 }, weight: 1 },
      ]),
    ).toStrictEqual({ bands: [2, 3], metresPerTexel: 2, variance: 3 });
  });

  test("gives no detail for no surface", () => {
    expect.hasAssertions();
    expect(averageSurfaceDetails([])).toBeUndefined();
  });

  test("gives no detail for surfaces sampled over no area", () => {
    expect.hasAssertions();
    expect(
      averageSurfaceDetails([{ detail: { bands: [1], metresPerTexel: 1, variance: 1 }, weight: 0 }]),
    ).toBeUndefined();
  });
});
