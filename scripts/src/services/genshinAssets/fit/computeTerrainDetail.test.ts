import { computeTerrainDetail } from "#src/services/genshinAssets/fit/computeTerrainDetail";
import { mapTerrainResidualGrid } from "#src/services/genshinAssets/fit/mapTerrainResidualGrid";
import { describe, expect, test } from "vitest";

describe(computeTerrainDetail, () => {
  const SIZE = 9;
  const grid = { originX: 0, originZ: 0, size: SIZE, step: 2, values: new Float64Array(SIZE * SIZE) };

  test("reads none on level ground, a sample not taken weighing nothing in its neighbours' mean", () => {
    expect.hasAssertions();

    const { values } = computeTerrainDetail(
      mapTerrainResidualGrid(grid, (x, z) => (x === 8 && z === 8 ? Number.NaN : 1)),
      2,
    );

    expect([...values]).toStrictEqual(
      Array.from({ length: SIZE * SIZE }, (_value, index) => (index === 40 ? Number.NaN : 0)),
    );
  });

  test("reads a spike less the share of it its own Gaussian mean holds", () => {
    expect.hasAssertions();

    const { values } = computeTerrainDetail(
      mapTerrainResidualGrid(grid, (x, z) => (x === 8 && z === 8 ? 1 : 0)),
      2,
    );
    // A sigma of one sample out to three: the centre tap is 1 over 1 + 2 (e^-1/2 + e^-2 + e^-9/2), squared over both axes
    const centreWeight = 1 / (1 + 2 * (Math.exp(-0.5) + Math.exp(-2) + Math.exp(-4.5)));

    expect(values[40]).toBeCloseTo(1 - centreWeight ** 2, 5);
  });
});
