import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { BuildingKit } from "#src/models/world/BuildingKit";
import { readRegionPalettes } from "#src/services/world/readRegionPalettes";
import { describe, expect, test } from "vitest";

describe(readRegionPalettes, () => {
  test("reads each sampled colour of every region's palette record as the hex number its kit is coloured with", async () => {
    expect.hasAssertions();

    const regionPalettes = await readRegionPalettes(GAME_DATA_LOCAL_BASE_URL);

    expect(regionPalettes).toStrictEqual({
      [BuildingKit.Fontaine]: { awning: 0x52869b, slate: 0x5b6871, stone: 0xad9275 },
      [BuildingKit.Inazuma]: { roofTile: 0x45455c, timber: 0x514333 },
      [BuildingKit.Liyue]: { lacquer: 0x924945, roof: 0x917030, stone: 0x727776 },
      [BuildingKit.Mondstadt]: { stone: 0x797b7e, timber: 0x725f58 },
      [BuildingKit.Natlan]: { building: 0x8c7255 },
      [BuildingKit.NodKrai]: { iron: 0x8a847f },
      [BuildingKit.Sumeru]: { terrace: 0x828582 },
    });
  });
});
