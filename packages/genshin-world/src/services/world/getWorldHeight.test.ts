import windriseGround from "#src/data/windrise/ground.json";
import { regionGroundSchema } from "#src/models/world/RegionGround";
import { WINDRISE_TERRAIN_OPTIONS } from "#src/services/windrise/constants";
import { getWorldHeight } from "#src/services/world/getWorldHeight";
import { jsonDateParse } from "@esposter/shared";
import { createTerrainShapeHeight } from "genshin-engine";
import { globSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(getWorldHeight, () => {
  const DATA_DIRECTORY = join(import.meta.dirname, "../../data");

  test("raises every region's ground at its plateaus, within the heights every tile is bounded by", () => {
    expect.hasAssertions();

    const getWindriseHeight = createTerrainShapeHeight(windriseGround);
    const plateaus = globSync("*/ground.json", { cwd: DATA_DIRECTORY })
      .filter((path) => path !== join("windrise", "ground.json"))
      .flatMap(
        (path) => regionGroundSchema.parse(jsonDateParse(readFileSync(join(DATA_DIRECTORY, path), "utf8"))).features,
      );
    const { maxHeight, minHeight } = WINDRISE_TERRAIN_OPTIONS;

    expect(plateaus).not.toHaveLength(0);

    for (const { height, x, z } of plateaus) {
      const worldHeight = getWorldHeight(x, z);

      expect(worldHeight - getWindriseHeight(x, z)).toBeCloseTo(height);
      expect(worldHeight).toBeGreaterThanOrEqual(minHeight);
      expect(worldHeight).toBeLessThanOrEqual(maxHeight);
    }
  });
});
