import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { readMirroredGameDataObject } from "#scripts/gameData/mirror/readMirroredGameDataObject";
import mondstadtRegionJson from "#src/data/regions/mondstadt.json";
import snezhnayaRegionJson from "#src/data/regions/snezhnaya.json";
import { BuildingKit } from "#src/models/world/BuildingKit";
import { regionDataSchema } from "#src/models/world/RegionData";
import { gameDataLock } from "#src/services/data/gameDataLock";
import { MONDSTADT_TIMBER_COLOR } from "#src/services/mondstadt/constants";
import { readRegionPalettes } from "#src/services/world/readRegionPalettes";
import { takeOne } from "@esposter/shared";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(readRegionPalettes, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  // Reads are memoized by URL, so this test names a base that no other test reads
  test("a palette missing one field reads the others and keeps that field's constant", async () => {
    expect.hasAssertions();

    // The mirror's Mondstadt palette without its timber, which a publish leaves out when it samples none of the kit's textures
    const palette: Record<string, unknown> = JSON.parse(
      await readMirroredGameDataObject(takeOne(gameDataLock.objects, "regions/mondstadt/palette")),
    );
    delete palette.timber;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json(palette));
    const { landmarks } = regionDataSchema.parse(mondstadtRegionJson);

    expect(await readRegionPalettes("game-data-without-timber", landmarks)).toStrictEqual({
      [BuildingKit.Mondstadt]: { stone: 0x797b7e, timber: MONDSTADT_TIMBER_COLOR },
    });
  });
});
