import type { GroundPieceArea } from "#src/models/genshinAssets/shared/GroundPieceArea";

import { getOutlineTileNames } from "#src/services/genshinAssets/world/getOutlineTileNames";
import { WorldLayer } from "genshin-world/definitions";
import { describe, expect, test } from "vitest";

describe(getOutlineTileNames, () => {
  const origin: [number, number, number] = [0, 0, 0];

  test("names only the tiles the outlines reach, with no capital's 2x2 among them", () => {
    expect.hasAssertions();

    const areas: GroundPieceArea[] = [
      {
        id: "far",
        layer: WorldLayer.Surface,
        outline: [
          { x: 2100, z: -3100 },
          { x: 2200, z: -3100 },
          { x: 2100, z: -3200 },
        ],
      },
    ];

    expect(getOutlineTileNames(areas, origin)).toStrictEqual(["BigWorldTerrain_2_3.bin"]);
  });

  test("names a tile once when two outlines reach it", () => {
    expect.hasAssertions();

    const areas: GroundPieceArea[] = [
      {
        id: "first",
        layer: WorldLayer.Surface,
        outline: [
          { x: 500, z: -500 },
          { x: 1500, z: -500 },
        ],
      },
      {
        id: "second",
        layer: WorldLayer.Surface,
        outline: [
          { x: 1000, z: -1000 },
          { x: 1100, z: -1100 },
        ],
      },
    ];

    expect(getOutlineTileNames(areas, origin)).toStrictEqual([
      "BigWorldTerrain_0_0.bin",
      "BigWorldTerrain_1_0.bin",
      "BigWorldTerrain_0_1.bin",
      "BigWorldTerrain_1_1.bin",
    ]);
  });
});
