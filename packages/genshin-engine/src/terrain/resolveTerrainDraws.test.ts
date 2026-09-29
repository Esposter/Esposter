import { createTerrainSelection } from "#src/terrain/createTerrainSelection";
import { getTerrainTileKey } from "#src/terrain/getTerrainTileKey";
import { resolveTerrainDraws } from "#src/terrain/resolveTerrainDraws";
import { describe, expect, test } from "vitest";

describe(resolveTerrainDraws, () => {
  const parentKey = getTerrainTileKey(1, 0, 0);
  const loadedChildKey = getTerrainTileKey(0, 0, 0);
  const missingChildKey = getTerrainTileKey(0, 1, 0);
  const wanted = createTerrainSelection(2);
  wanted.keys.set([loadedChildKey, missingChildKey]);
  wanted.count = 2;

  test("draws the nearest loaded ancestor in place of a missing tile, and nothing it covers", () => {
    expect.hasAssertions();

    const { count, keys } = resolveTerrainDraws(
      { levelCount: 2 },
      wanted,
      (key) => key !== missingChildKey,
      createTerrainSelection(2),
    );

    expect([...keys.subarray(0, count)]).toStrictEqual([parentKey]);
  });

  test("draws every wanted tile once all have arrived", () => {
    expect.hasAssertions();

    const { count, keys } = resolveTerrainDraws({ levelCount: 2 }, wanted, () => true, createTerrainSelection(2));

    expect([...keys.subarray(0, count)]).toStrictEqual([loadedChildKey, missingChildKey]);
  });
});
