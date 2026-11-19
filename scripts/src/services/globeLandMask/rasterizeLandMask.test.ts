import type { LandRows } from "#src/models/globeLandMask/LandRows";
import type { WorldFeature } from "#src/models/globeLandMask/WorldFeature";

import { GeometryType } from "#src/models/globeLandMask/GeometryType";
import { rasterizeLandMask } from "#src/services/globeLandMask/rasterizeLandMask";
import { describe, expect, test } from "vitest";

const createSquare = (west: number, south: number, east: number, north: number): [number, number][] => [
  [west, south],
  [east, south],
  [east, north],
  [west, north],
  [west, south],
];

// The rows holding a run, each with its index and its runs, so the rows that hold none are asserted as empty too
const getOccupiedRows = (rows: LandRows): [number, number[]][] =>
  rows.flatMap((row, index) => (row.length > 0 ? [[index, row] as [number, number[]]] : []));

describe(rasterizeLandMask, () => {
  test("a square lands in the cells whose centres it holds", () => {
    expect.hasAssertions();

    const feature: WorldFeature = { geometry: { coordinates: [createSquare(0, 0, 1, 1)], type: GeometryType.Polygon } };
    const { rows } = rasterizeLandMask([feature], 1);

    expect(rows).toHaveLength(180);
    expect(getOccupiedRows(rows)).toStrictEqual([[89, [180, 181]]]);
  });

  test("a hole is sea", () => {
    expect.hasAssertions();

    const feature: WorldFeature = {
      geometry: { coordinates: [createSquare(0, 0, 4, 4), createSquare(1, 1, 3, 3)], type: GeometryType.Polygon },
    };

    expect(getOccupiedRows(rasterizeLandMask([feature], 1).rows)).toStrictEqual([
      [86, [180, 184]],
      [87, [180, 181, 183, 184]],
      [88, [180, 181, 183, 184]],
      [89, [180, 184]],
    ]);
  });

  test("two touching countries join into one run", () => {
    expect.hasAssertions();

    const features: WorldFeature[] = [
      { geometry: { coordinates: [createSquare(0, 0, 1, 1)], type: GeometryType.Polygon } },
      { geometry: { coordinates: [[createSquare(1, 0, 2, 1)]], type: GeometryType.MultiPolygon } },
    ];

    expect(getOccupiedRows(rasterizeLandMask(features, 1).rows)).toStrictEqual([[89, [180, 182]]]);
  });

  test("the resolution scales the grid", () => {
    expect.hasAssertions();

    const feature: WorldFeature = { geometry: { coordinates: [createSquare(0, 0, 1, 1)], type: GeometryType.Polygon } };
    const { cellsPerDegree, rows } = rasterizeLandMask([feature], 2);

    expect(cellsPerDegree).toBe(2);
    expect(rows).toHaveLength(360);
    expect(getOccupiedRows(rows)).toStrictEqual([
      [178, [360, 362]],
      [179, [360, 362]],
    ]);
  });
});
