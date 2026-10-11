import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { regionGroundSchema } from "#src/models/world/RegionGround";
import { readGameData } from "#src/services/data/readGameData";
import { readRegionGround } from "#src/services/world/readRegionGround";
import { describe, expect, test } from "vitest";

describe(readRegionGround, () => {
  test("reads a region's own ground by its id", async () => {
    expect.hasAssertions();

    const ground = await readRegionGround(GAME_DATA_LOCAL_BASE_URL, "liyue");

    expect(ground).toStrictEqual(await readGameData(GAME_DATA_LOCAL_BASE_URL, "ground/liyue", regionGroundSchema));
  });

  test("reads no ground for Mondstadt, whose capital stands on Windrise's own", async () => {
    expect.hasAssertions();

    await expect(readRegionGround(GAME_DATA_LOCAL_BASE_URL, "mondstadt")).resolves.toBeUndefined();
  });
});
