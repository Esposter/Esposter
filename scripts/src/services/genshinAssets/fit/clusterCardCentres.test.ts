import { clusterCardCentres } from "#src/services/genshinAssets/fit/clusterCardCentres";
import { describe, expect, test } from "vitest";

describe(clusterCardCentres, () => {
  const SEED = 0;

  test("centres each cluster on its cards, reaching their distance, holding their leaf, and sorts the clusters by height", () => {
    expect.hasAssertions();

    expect(
      clusterCardCentres(
        [
          { centre: [0, 11, 0], leafArea: 1 },
          { centre: [0, 1, 0], leafArea: 1 },
          { centre: [0, 13, 0], leafArea: 2 },
          { centre: [0, 3, 0], leafArea: 1 },
        ],
        2,
        SEED,
      ),
    ).toStrictEqual([
      { leafArea: 2, radius: 1, x: 0, y: 2, z: 0 },
      { leafArea: 3, radius: 1, x: 0, y: 12, z: 0 },
    ]);
  });
});
