import type { SkyStatistics } from "#src/models/genshinParity/sky/SkyStatistics";

import { computeSkySplitSpread } from "#src/services/genshinParity/sky/computeSkySplitSpread";
import { describe, expect, test } from "vitest";

describe(computeSkySplitSpread, () => {
  const width = 4;

  test("reads the root mean square of the halves' distance over its splits", () => {
    expect.hasAssertions();

    // A sky of one row, whose cover is the share of it in its left half: blocks of two deal the left half to one half
    // Unshifted, a distance of one, and evenly between them shifted by one, a distance of none
    const sky = Uint8Array.from([1, 1, 1, 1, 0, 0, 0, 0]);
    const readStatistics = (region: Uint8Array): SkyStatistics => ({
      clearColour: [0, 0, 0],
      clouds: { contrast: 1, coverage: 0, edgeSharpness: 0, spread: 0 },
      elevationCoverage: [
        region.filter((isSky, pixel) => isSky && pixel % width < width / 2).length / region.filter(Boolean).length,
      ],
    });

    expect(computeSkySplitSpread(readStatistics, sky, width, [2])).toStrictEqual({
      brightness: 0,
      colour: 0,
      cover: Math.SQRT1_2,
      edgeSharpness: 0,
      spread: 0,
    });
  });
});
