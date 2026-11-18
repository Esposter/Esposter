import type { LaidGround } from "#src/models/world/LaidGround";

import { createWindriseTerrainOptions } from "#src/services/windrise/createWindriseTerrainOptions";
import { describe, expect, test } from "vitest";

describe(createWindriseTerrainOptions, () => {
  test("bounds the terrain by the highest and lowest of the base and of each ground laid over it", () => {
    expect.hasAssertions();

    const baseGround = { base: 24, features: [], hills: [], maxHeight: 299, minHeight: -8 };
    const laidGround: LaidGround = {
      domain: { outline: [{ x: 0, z: 0 }] },
      ground: { base: 60, features: [], hills: [], maxHeight: 520, minHeight: 40 },
    };

    expect(createWindriseTerrainOptions([baseGround], [laidGround])).toStrictEqual({
      cellsPerSide: 32,
      finestRange: 64,
      finestTileSize: 16,
      levelCount: 6,
      maxHeight: 520,
      minHeight: -8,
    });
  });
});
