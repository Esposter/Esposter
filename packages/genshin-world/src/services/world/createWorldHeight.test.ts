import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createWindriseTerrainOptions } from "#src/services/windrise/createWindriseTerrainOptions";
import { readWindriseData } from "#src/services/windrise/readWindriseData";
import { createWorldHeight } from "#src/services/world/createWorldHeight";
import { createTerrainShapeHeight } from "genshin-engine";
import { describe, expect, test } from "vitest";

const { baseGround, regionGrounds } = await readWindriseData(GAME_DATA_LOCAL_BASE_URL);

describe(createWorldHeight, () => {
  test("raises every region's ground at its plateaus, within the heights every tile is bounded by", () => {
    expect.hasAssertions();

    const getGroundHeight = createWorldHeight(baseGround, regionGrounds);
    const getWindriseHeight = createTerrainShapeHeight(baseGround);
    const plateaus = regionGrounds.flatMap(({ features }) => features);
    const { maxHeight, minHeight } = createWindriseTerrainOptions(baseGround);

    expect(plateaus).not.toHaveLength(0);

    for (const { height, x, z } of plateaus) {
      const groundHeight = getGroundHeight(x, z);

      expect(groundHeight - getWindriseHeight(x, z)).toBeCloseTo(height);
      expect(groundHeight).toBeGreaterThanOrEqual(minHeight);
      expect(groundHeight).toBeLessThanOrEqual(maxHeight);
    }
  });
});
