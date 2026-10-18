import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { regionGroundSchema } from "#src/models/world/RegionGround";
import { readGameData } from "#src/services/data/readGameData";
import { createWindriseTerrainOptions } from "#src/services/windrise/createWindriseTerrainOptions";
import { readWindriseData } from "#src/services/windrise/readWindriseData";
import { checkIsGameDataKey } from "#src/services/data/checkIsGameDataKey";
import { gameDataLock } from "#src/services/data/gameDataLock";
import { selectLaidGroundKeys } from "#src/services/world/selectLaidGroundKeys";
import { createWorldHeight } from "#src/services/world/createWorldHeight";
import { createTerrainShapeHeight, TerrainFeatureKind } from "genshin-engine";
import { describe, expect, test } from "vitest";

const { baseGround } = await readWindriseData(GAME_DATA_LOCAL_BASE_URL);
const regionGrounds = await Promise.all(
  selectLaidGroundKeys(Object.keys(gameDataLock.objects).filter((key) => checkIsGameDataKey(key))).map((key) =>
    readGameData(GAME_DATA_LOCAL_BASE_URL, key, regionGroundSchema),
  ),
);

describe(createWorldHeight, () => {
  test("raises every region no fit has drawn at its plateaus, within the heights every tile is bounded by", () => {
    expect.hasAssertions();

    const getGroundHeight = createWorldHeight(baseGround, regionGrounds);
    const getWindriseHeight = createTerrainShapeHeight(baseGround);
    const plateaus = regionGrounds
      .filter(({ hills }) => hills.length === 0)
      .flatMap(({ features }) => features.filter((feature) => feature.kind === TerrainFeatureKind.Plateau));
    const { maxHeight, minHeight } = createWindriseTerrainOptions([baseGround]);

    expect(plateaus).not.toHaveLength(0);

    for (const { height, x, z } of plateaus) {
      const groundHeight = getGroundHeight(x, z);

      expect(groundHeight - getWindriseHeight(x, z)).toBeCloseTo(height);
      expect(groundHeight).toBeGreaterThanOrEqual(minHeight);
      expect(groundHeight).toBeLessThanOrEqual(maxHeight);
    }
  });

  test("stands every region's ground within the heights Windrise's ground bounds every tile by", () => {
    expect.hasAssertions();

    const { maxHeight, minHeight } = createWindriseTerrainOptions([baseGround]);
    const outOfBoundsGrounds = regionGrounds.filter(
      (regionGround) =>
        (regionGround.minHeight ?? minHeight) < minHeight || (regionGround.maxHeight ?? maxHeight) > maxHeight,
    );

    expect(outOfBoundsGrounds).toStrictEqual([]);
  });

  test("draws Windrise's own features as its fitted ground does", () => {
    expect.hasAssertions();

    const getGroundHeight = createWorldHeight(baseGround, []);
    const getWindriseHeight = createTerrainShapeHeight(baseGround);
    const cliffs = baseGround.features.filter((feature) => feature.kind === TerrainFeatureKind.Cliff);

    expect(cliffs).not.toHaveLength(0);

    for (const { endX, endZ, startX, startZ } of cliffs) {
      const x = (startX + endX) / 2;
      const z = (startZ + endZ) / 2;

      expect(getGroundHeight(x, z)).toBe(getWindriseHeight(x, z));
    }
  });
});
