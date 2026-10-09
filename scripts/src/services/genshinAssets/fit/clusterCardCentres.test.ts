import { clusterCardCentres } from "#src/services/genshinAssets/fit/clusterCardCentres";
import { describe, expect, test } from "vitest";

describe(clusterCardCentres, () => {
  const SEED = 0;

  test("centres each cluster on its points, reaching their distance, and sorts the clusters by height", () => {
    expect.hasAssertions();

    expect(
      clusterCardCentres(
        [
          [0, 11, 0],
          [0, 1, 0],
          [0, 13, 0],
          [0, 3, 0],
        ],
        2,
        SEED,
      ),
    ).toStrictEqual([
      { radius: 1, x: 0, y: 2, z: 0 },
      { radius: 1, x: 0, y: 12, z: 0 },
    ]);
  });
});
