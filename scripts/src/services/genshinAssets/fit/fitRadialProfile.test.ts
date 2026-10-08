import { fitRadialProfile } from "#src/services/genshinAssets/fit/fitRadialProfile";
import { describe, expect, test } from "vitest";

describe(fitRadialProfile, () => {
  test("reads each sector's outermost radius, and a sector no vertex reaches from its nearest neighbour", () => {
    expect.hasAssertions();

    // A ring of four at radius 2 on the floor of the first band, and a pair on the second band's +x and -x only
    const { axis, foot, sections } = fitRadialProfile(
      [
        [12, 5, 20],
        [8, 5, 20],
        [10, 5, 22],
        [10, 5, 18],
        [11, 7, 20],
        [9, 7, 20],
      ],
      { angleCount: 4, bandHeight: 1, tolerance: 0.1 },
    );

    expect(axis).toStrictEqual([10, 20]);
    expect(foot).toBe(5);
    expect(sections).toStrictEqual([
      { height: 1, radii: [2, 2, 2, 2] },
      { height: 1, radii: [1, 1, 1, 1] },
    ]);
  });
});
