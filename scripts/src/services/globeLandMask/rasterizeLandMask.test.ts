import type { WorldFeature } from "#src/models/globeLandMask/WorldFeature";

import { rasterizeLandMask } from "#src/services/globeLandMask/rasterizeLandMask";
import { describe, expect, test } from "vitest";

const createSquare = (west: number, south: number, east: number, north: number) => [
  [west, south],
  [east, south],
  [east, north],
  [west, north],
  [west, south],
];

describe(rasterizeLandMask, () => {
  test("a square lands in the cells whose centres it holds", () => {
    expect.hasAssertions();

    const feature: WorldFeature = { geometry: { coordinates: [createSquare(0, 0, 1, 1)], type: "Polygon" } };
    const { rows } = rasterizeLandMask([feature], 1);

    expect(rows).toHaveLength(180);
    expect(rows[89]).toStrictEqual([180, 181]);
    expect(rows.filter((row) => row.length > 0)).toHaveLength(1);
  });

  test("a hole is sea", () => {
    expect.hasAssertions();

    const feature: WorldFeature = {
      geometry: { coordinates: [createSquare(0, 0, 4, 4), createSquare(1, 1, 3, 3)], type: "Polygon" },
    };

    expect(rasterizeLandMask([feature], 1).rows[88]).toStrictEqual([180, 181, 183, 184]);
  });

  test("two touching countries join into one run", () => {
    expect.hasAssertions();

    const features: WorldFeature[] = [
      { geometry: { coordinates: [createSquare(0, 0, 1, 1)], type: "Polygon" } },
      { geometry: { coordinates: [[createSquare(1, 0, 2, 1)]], type: "MultiPolygon" } },
    ];

    expect(rasterizeLandMask(features, 1).rows[89]).toStrictEqual([180, 182]);
  });

  test("the resolution scales the grid", () => {
    expect.hasAssertions();

    const feature: WorldFeature = { geometry: { coordinates: [createSquare(0, 0, 1, 1)], type: "Polygon" } };
    const { cellsPerDegree, rows } = rasterizeLandMask([feature], 2);

    expect(cellsPerDegree).toBe(2);
    expect(rows).toHaveLength(360);
    expect(rows[178]).toStrictEqual([360, 362]);
  });
});
