import { clusterColours } from "#src/services/genshinAssets/fit/clusterColours";
import { describe, expect, test } from "vitest";

describe(clusterColours, () => {
  test("groups each colour with the nearest of the clusters' means, darkest first", () => {
    expect.hasAssertions();

    expect([
      ...clusterColours(
        [
          [1, 1, 1],
          [0, 0, 0],
          [0.9, 1, 1],
          [0.1, 0, 0],
          [0, 0.1, 0],
        ],
        2,
      ),
    ]).toStrictEqual([1, 0, 1, 0, 0]);
  });
});
