import { computeTerrainTile } from "#src/terrain/computeTerrainTile";
import { getTerrainTileKey } from "#src/terrain/getTerrainTileKey";
import { describe, expect, test } from "vitest";

// Records each vertex's world x in its red channel, so a test reads where the colour was sampled
const writeWorldX = (colors: Float32Array, offset: number, _height: number, _slope: number, x: number) => {
  colors[offset] = x;
};
// Cubic, so a slope taken across one cell differs from one taken across two, as no quadratic's does
const getCurvedHeight = (x: number, z: number) => x ** 3 + 3 * z;
// Records everything a colour is given, so a test reads the height, slope and place it was sampled with
const writeSample = (colors: Float32Array, offset: number, height: number, slope: number, x: number) => {
  colors.set([height, slope, x], offset);
};
// The first three components of each vertex at the indices, from arrays of the stride
const readVectors = (values: Float32Array, indices: number[], stride: number) =>
  indices.map((index) => [...values.subarray(index * stride, index * stride + 3)]);

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

  test("morphs fully onto its parent's position, normal and colour, so a change of level draws the same ground", () => {
    expect.hasAssertions();

    const cellsPerSide = 2;
    const finestTileSize = 2;
    const tile = computeTerrainTile({
      cellsPerSide,
      finestTileSize,
      getHeight: getCurvedHeight,
      key: getTerrainTileKey(0, 0, 0),
      writeColor: writeSample,
    });
    const parent = computeTerrainTile({
      cellsPerSide,
      finestTileSize,
      getHeight: getCurvedHeight,
      key: getTerrainTileKey(1, 0, 0),
      writeColor: writeSample,
    });
    const side = cellsPerSide + 1;
    // Each vertex's coarse values beside the parent's at the point it collapses onto, the parent's step twice its own
    const parentIndices = Array.from({ length: side * side }, (_value, index) => {
      const coarseX = tile.coarsePositions[index * 4] ?? 0;
      const coarseZ = tile.coarsePositions[index * 4 + 2] ?? 0;
      return (coarseZ / 2) * side + coarseX / 2;
    });
    const indices = parentIndices.map((_parentIndex, index) => index);

    expect({
      colors: readVectors(tile.coarseColors, indices, 3),
      normals: readVectors(tile.coarseNormals, indices, 3),
      positions: readVectors(tile.coarsePositions, indices, 4),
    }).toStrictEqual({
      colors: readVectors(parent.colors, parentIndices, 3),
      normals: readVectors(parent.normals, parentIndices, 3),
      positions: readVectors(parent.positions, parentIndices, 3),
    });
  });
});
