import { computeScoredMask } from "#src/services/genshinParity/reference/computeScoredMask";
import { describe, expect, test } from "vitest";

describe(computeScoredMask, () => {
  const region = { height: 2, width: 4, x: 0, y: 0 };

  test("scores the pixels whose middle a rectangle covers, on the region's own raster", () => {
    expect.hasAssertions();

    expect(computeScoredMask([{ height: 2, width: 2, x: 1, y: 0 }], region, region.width, region.height)).toStrictEqual(
      Uint8Array.from([0, 1, 1, 0, 0, 1, 1, 0]),
    );
  });

  test("reads a smaller raster at the place each of its pixels' middles has in the region", () => {
    expect.hasAssertions();

    expect(computeScoredMask([{ height: 2, width: 2, x: 0, y: 0 }], region, 2, 1)).toStrictEqual(
      Uint8Array.from([1, 0]),
    );
  });
});
