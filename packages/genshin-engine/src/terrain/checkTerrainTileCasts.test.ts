import { checkTerrainTileCasts } from "#src/terrain/checkTerrainTileCasts";
import { getTerrainTileKey } from "#src/terrain/getTerrainTileKey";
import { describe, expect, test } from "vitest";

const FINEST_RANGE = 64;
const SHADOW_REACH = 128;

describe(checkTerrainTileCasts, () => {
  test("casts from a ring whose range is within the shadows' reach", () => {
    expect.hasAssertions();

    expect(checkTerrainTileCasts({ finestRange: FINEST_RANGE }, getTerrainTileKey(1, 0, 0), SHADOW_REACH)).toBe(true);
  });

  test("casts nothing from a ring whose range is past the shadows' reach", () => {
    expect.hasAssertions();

    expect(checkTerrainTileCasts({ finestRange: FINEST_RANGE }, getTerrainTileKey(2, 0, 0), SHADOW_REACH)).toBe(false);
  });
});
