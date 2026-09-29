import { computeTerrainTile } from "#src/terrain/computeTerrainTile";
import { getTerrainTileKey } from "#src/terrain/getTerrainTileKey";
import { describe, expect, test } from "vitest";

// Records each vertex's world x in its red channel, so a test reads where the colour was sampled
const writeWorldX = (colors: Float32Array, offset: number, _height: number, _slope: number, x: number) => {
  colors[offset] = x;
};

describe(computeTerrainTile, () => {
  test("lays the grid from the tile's corner, collapsing odd vertices onto the coarser grid", () => {
    expect.hasAssertions();

    const { coarsePositions, colors, positions } = computeTerrainTile({
      cellsPerSide: 2,
      finestTileSize: 2,
      getHeight: (x) => x,
      key: getTerrainTileKey(0, 1, 0),
      writeColor: writeWorldX,
    });

    expect({
      firstRowCoarsePositions: coarsePositions.subarray(0, 12),
      firstRowColors: colors.subarray(0, 9),
      firstRowPositions: positions.subarray(0, 9),
    }).toStrictEqual({
      firstRowCoarsePositions: Float32Array.from([0, 2, 0, 0, 0, 2, 0, 0, 2, 4, 0, 0]),
      firstRowColors: Float32Array.from([2, 0, 0, 3, 0, 0, 4, 0, 0]),
      firstRowPositions: Float32Array.from([0, 2, 0, 1, 3, 0, 2, 4, 0]),
    });
  });
});
