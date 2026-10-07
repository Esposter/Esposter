import type { TerrainSelection } from "#src/models/terrain/TerrainSelection";

import { checkTerrainDrawsChanged } from "#src/terrain/checkTerrainDrawsChanged";
import { getTerrainTileKey } from "#src/terrain/getTerrainTileKey";
import { describe, expect, test } from "vitest";

const createSelection = (keys: number[]): TerrainSelection => ({ count: keys.length, keys: new Float64Array(keys) });

describe(checkTerrainDrawsChanged, () => {
  const terrainOptions = { finestTileSize: 1 };
  const center = { x: 0, y: 0, z: 0 };
  const halfSize = 1;
  const insideKey = getTerrainTileKey(0, 0, 0);
  const outsideKey = getTerrainTileKey(0, 2, 0);

  test("finds no change when the same tiles are drawn in another order", () => {
    expect.hasAssertions();

    expect(
      checkTerrainDrawsChanged(
        terrainOptions,
        createSelection([insideKey, outsideKey]),
        createSelection([outsideKey, insideKey]),
        center,
        halfSize,
      ),
    ).toBe(false);
  });

  test("finds no change when only a tile outside the square came or went", () => {
    expect.hasAssertions();

    expect(
      checkTerrainDrawsChanged(
        terrainOptions,
        createSelection([insideKey]),
        createSelection([insideKey, outsideKey]),
        center,
        halfSize,
      ),
    ).toBe(false);
  });

  test.each([
    ["came", [], [insideKey]],
    ["went", [insideKey], []],
  ])("finds a change when a tile over the square %s", (_description, previousKeys, nextKeys) => {
    expect.hasAssertions();

    expect(
      checkTerrainDrawsChanged(
        terrainOptions,
        createSelection(previousKeys),
        createSelection(nextKeys),
        center,
        halfSize,
      ),
    ).toBe(true);
  });
});
