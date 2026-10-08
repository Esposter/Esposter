import { sampleFaceUvs } from "#src/services/genshinAssets/fit/sampleFaceUvs";
import { describe, expect, test } from "vitest";

describe(sampleFaceUvs, () => {
  test("reads a face covering few texels at its centroid", () => {
    expect.hasAssertions();

    expect(
      sampleFaceUvs(
        [
          [0, 0],
          [1, 0],
          [0, 1],
        ],
        { height: 1, width: 1 },
      ),
    ).toStrictEqual([[1 / 3, 1 / 3]]);
  });

  test("spreads a face covering many texels over a lattice inside it", () => {
    expect.hasAssertions();

    const points = sampleFaceUvs(
      [
        [0, 0],
        [1, 0],
        [0, 1],
      ],
      { height: 1024, width: 1024 },
    );

    expect(points).toHaveLength(36);
    expect(points.every(([u, v]) => u > 0 && v > 0 && u + v < 1)).toBe(true);
  });
});
