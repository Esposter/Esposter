import { computeTerrainIndices } from "#src/terrain/computeTerrainIndices";
import { describe, expect, test } from "vitest";

describe(computeTerrainIndices, () => {
  test("addresses the last vertex of a grid past sixteen-bit indices", () => {
    expect.hasAssertions();

    const cellsPerSide = 256;

    expect(computeTerrainIndices(cellsPerSide).at(-1)).toBe((cellsPerSide + 1) ** 2 - 1);
  });
});
