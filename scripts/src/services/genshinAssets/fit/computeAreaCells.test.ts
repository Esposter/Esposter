import { computeAreaCells } from "#src/services/genshinAssets/fit/computeAreaCells";
import { describe, expect, test } from "vitest";

describe(computeAreaCells, () => {
  // Tiles of four metres cut into metre cells
  const grid = { cellSize: 1, tileSize: 4 } as const;

  test("splits a tile two areas' points stand on by the point nearest each cell", () => {
    expect.hasAssertions();

    const { areaCellsMap, width } = computeAreaCells(
      [
        { area: "a", x: 0.5, z: 0.5 },
        { area: "b", x: 3.5, z: 0.5 },
      ],
      grid,
    );

    expect(width).toBe(4);
    expect(areaCellsMap.get("a")).toStrictEqual([0, 1, 4, 5, 8, 9, 12, 13]);
    expect(areaCellsMap.get("b")).toStrictEqual([2, 3, 6, 7, 10, 11, 14, 15]);
  });

  test("leaves a tile no point stands on to no area", () => {
    expect.hasAssertions();

    const { areaCellsMap, corner, width } = computeAreaCells(
      [
        { area: "a", x: -3.5, z: 0.5 },
        { area: "b", x: 4.5, z: 0.5 },
      ],
      grid,
    );
    const columns = [...areaCellsMap.values()].flat().map((cell) => cell % width);

    expect(corner).toStrictEqual([-4, 0]);
    expect(width).toBe(12);
    expect(columns.filter((column) => column >= 4 && column < 8)).toStrictEqual([]);
    expect(columns).toHaveLength(32);
  });
});
