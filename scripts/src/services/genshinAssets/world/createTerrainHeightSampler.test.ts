import { createTerrainHeightSampler } from "#src/services/genshinAssets/world/createTerrainHeightSampler";
import { describe, expect, test } from "vitest";

describe(createTerrainHeightSampler, () => {
  test("reads a tile at its column and row between samples, its far edge included, and nothing off it", () => {
    expect.hasAssertions();

    // Its near row along z low and its far row high, so halfway along z reads between them only if rows run along z
    const getHeight = createTerrainHeightSampler([
      {
        column: 1,
        row: -1,
        terrainHeights: { heights: Float32Array.from([0, 0, 2, 2]), resolution: 2, spacing: 1024 },
      },
    ]);

    expect(getHeight(1024, -512)).toBe(1);
    expect(getHeight(2047, -1)).toBeCloseTo(2, 2);
    expect(getHeight(0, -512)).toBeNaN();
  });
});
