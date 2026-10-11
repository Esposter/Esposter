import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import mondstadtRegionJson from "#src/data/regions/mondstadt.json";
import snezhnayaRegionJson from "#src/data/regions/snezhnaya.json";
import { BuildingKit } from "#src/models/world/BuildingKit";
import { regionDataSchema } from "#src/models/world/RegionData";
import { readRegionPalettes } from "#src/services/world/readRegionPalettes";
import { describe, expect, test } from "vitest";

describe(readRegionPalettes, () => {
  test.each([
    ["Mondstadt", mondstadtRegionJson, { [BuildingKit.Mondstadt]: { stone: 0x797b7e, timber: 0x725f58 } }],
    ["Snezhnaya", snezhnayaRegionJson, {}],
  ])(
    "reads %s's palette alone, for the kits its buildings are built by, as the hex numbers its kit is coloured with",
    async (_name, regionJson, expectedRegionPalettes) => {
      expect.hasAssertions();

      const { landmarks } = regionDataSchema.parse(regionJson);
      const regionPalettes = await readRegionPalettes(GAME_DATA_LOCAL_BASE_URL, landmarks);

      expect(regionPalettes).toStrictEqual(expectedRegionPalettes);
    },
  );
});
