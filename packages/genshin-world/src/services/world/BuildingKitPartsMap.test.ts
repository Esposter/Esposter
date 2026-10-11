import type { RegionPaletteMap } from "#src/models/world/RegionPaletteMap";

import { BuildingKit } from "#src/models/world/BuildingKit";
import { MONDSTADT_PLASTER_COLOR, MONDSTADT_ROOF_COLOR } from "#src/services/mondstadt/constants";
import { BuildingKitPartsMap } from "#src/services/world/BuildingKitPartsMap";
import { describe, expect, test } from "vitest";

describe("buildingKitPartsMap", () => {
  const regionPalettes: RegionPaletteMap = {
    [BuildingKit.Fontaine]: { awning: 1, slate: 2, stone: 3 },
    [BuildingKit.Inazuma]: { roofTile: 4, timber: 5 },
    [BuildingKit.Liyue]: { lacquer: 1, roof: 2, stone: 3 },
    [BuildingKit.Mondstadt]: { stone: 4, timber: 5 },
    [BuildingKit.Natlan]: { building: 6 },
    [BuildingKit.NodKrai]: { iron: 7 },
    [BuildingKit.Sumeru]: { terrace: 8 },
  };

  test("colours a Liyue building's parts from the palette record", () => {
    expect.hasAssertions();

    const parts = BuildingKitPartsMap[BuildingKit.Liyue](
      { depth: 6, roofTierCount: 1, storeyHeight: 3, width: 6 },
      regionPalettes,
    );

    expect(parts.map(({ color }) => color)).toStrictEqual([1, 2, 3]);
  });

  test("keeps the kit's constant for a colour the palette record does not sample", () => {
    expect.hasAssertions();

    const parts = BuildingKitPartsMap[BuildingKit.Mondstadt](
      {
        depth: 6,
        dormerCount: 0,
        groundHeight: 3,
        jettyDepth: 0,
        roofRise: 2,
        storeyCount: 1,
        storeyHeight: 3,
        width: 6,
      },
      regionPalettes,
    );

    expect(parts.map(({ color }) => color)).toStrictEqual([MONDSTADT_PLASTER_COLOR, MONDSTADT_ROOF_COLOR, 4, 5]);
  });
});
