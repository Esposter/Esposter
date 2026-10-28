import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { readMirroredGameDataObject } from "#scripts/gameData/mirror/readMirroredGameDataObject";
import mondstadtRegionJson from "#src/data/regions/mondstadt.json";
import snezhnayaRegionJson from "#src/data/regions/snezhnaya.json";
import { BuildingKit } from "#src/models/world/BuildingKit";
import { regionDataSchema } from "#src/models/world/RegionData";
import { gameDataLock } from "#src/services/data/gameDataLock";
import { MONDSTADT_TIMBER_COLOR } from "#src/services/mondstadt/constants";
import { readRegionPalettes } from "#src/services/world/readRegionPalettes";
import { jsonDateParse, takeOne } from "@esposter/shared";
import { afterEach, describe, expect, test, vi } from "vitest";

// A palette's hex colour as the number a material is coloured with
const parseHexColour = (hex: string): number => Number.parseInt(hex.slice(1), 16);
// The Mondstadt palette the mirror holds, as the publish wrote it
const readMondstadtPalette = async (): Promise<{ stone: { hex: string }; timber: { hex: string } }> => {
  const key = "regions/mondstadt/palette";
  return jsonDateParse(await readMirroredGameDataObject(key, takeOne(gameDataLock.objects, key)));
};

describe(readRegionPalettes, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("reads Mondstadt's palette from the mirror, as the hex numbers its kit is coloured with", async () => {
    expect.hasAssertions();

    const { landmarks } = regionDataSchema.parse(mondstadtRegionJson);
    const palette = await readMondstadtPalette();

    await expect(readRegionPalettes(GAME_DATA_LOCAL_BASE_URL, landmarks)).resolves.toStrictEqual({
      [BuildingKit.Mondstadt]: { stone: parseHexColour(palette.stone.hex), timber: parseHexColour(palette.timber.hex) },
    });
  });

  test("reads Snezhnaya's palette as none, since its kit has no record", async () => {
    expect.hasAssertions();

    const { landmarks } = regionDataSchema.parse(snezhnayaRegionJson);

    await expect(readRegionPalettes(GAME_DATA_LOCAL_BASE_URL, landmarks)).resolves.toStrictEqual({});
  });

  // Reads are memoized by URL, so this test names a base that no other test reads
  test("a palette missing one field reads the others and keeps that field's constant", async () => {
    expect.hasAssertions();

    const palette = await readMondstadtPalette();
    // The Mondstadt palette without its timber, which a publish leaves out when it samples none of the kit's textures
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ stone: palette.stone }));
    const { landmarks } = regionDataSchema.parse(mondstadtRegionJson);

    await expect(readRegionPalettes("game-data-without-timber", landmarks)).resolves.toStrictEqual({
      [BuildingKit.Mondstadt]: { stone: parseHexColour(palette.stone.hex), timber: MONDSTADT_TIMBER_COLOR },
    });
  });
});
