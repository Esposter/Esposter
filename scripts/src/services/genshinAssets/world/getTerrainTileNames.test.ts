import type { GroundPieceArea } from "#src/models/genshinAssets/fit/GroundPieceArea";

import { getTerrainTileNames } from "#src/services/genshinAssets/world/getTerrainTileNames";
import { describe, expect, test } from "vitest";

const origin: [number, number, number] = [0, 0, 0];

describe(getTerrainTileNames, () => {
  test("names the capital's tile and its east, north and north-east neighbours, as Windrise's ground is", () => {
    expect.hasAssertions();

    expect(getTerrainTileNames({ column: 1, row: -2 }, [], origin)).toStrictEqual([
      "BigWorldTerrain_1_-2.bin",
      "BigWorldTerrain_2_-2.bin",
      "BigWorldTerrain_1_-1.bin",
      "BigWorldTerrain_2_-1.bin",
    ]);
  });

  test("names every tile an area outline reaches, its z taken from the origin's less the outline's", () => {
    expect.hasAssertions();

    const areas: GroundPieceArea[] = [
      {
        id: "far",
        outline: [
          { x: 2100, z: -3100 },
          { x: 2200, z: -3100 },
          { x: 2100, z: -3200 },
        ],
      },
    ];

    expect(getTerrainTileNames({ column: 0, row: 0 }, areas, origin)).toStrictEqual([
      "BigWorldTerrain_0_0.bin",
      "BigWorldTerrain_1_0.bin",
      "BigWorldTerrain_0_1.bin",
      "BigWorldTerrain_1_1.bin",
      "BigWorldTerrain_2_3.bin",
    ]);
  });

  test("names a tile once when the capital's block and an outline both reach it", () => {
    expect.hasAssertions();

    const areas: GroundPieceArea[] = [
      {
        id: "near",
        outline: [
          { x: 500, z: -500 },
          { x: 1500, z: -500 },
        ],
      },
    ];

    expect(getTerrainTileNames({ column: 0, row: 0 }, areas, origin)).toStrictEqual([
      "BigWorldTerrain_0_0.bin",
      "BigWorldTerrain_1_0.bin",
      "BigWorldTerrain_0_1.bin",
      "BigWorldTerrain_1_1.bin",
    ]);
  });
});
