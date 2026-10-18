import type { RegionGround } from "#src/models/world/RegionGround";

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

const { baseGrounds } = await readWindriseData(GAME_DATA_LOCAL_BASE_URL);
const regionGrounds = await Promise.all(
  selectLaidGroundKeys(Object.keys(gameDataLock.objects).filter((key) => checkIsGameDataKey(key))).map((key) =>
    readGameData(GAME_DATA_LOCAL_BASE_URL, key, regionGroundSchema),
  ),
);
// Four made-up quarters of a disc split at the origin, each with its own base, a hill or two and a feature, one cliff
// Crossing the seam at x = 0. Their heights must read the same from either side of each seam
const quarters: [RegionGround, ...RegionGround[]] = [
  {
    base: 12,
    features: [
      {
        endX: 60,
        endZ: 200,
        falloff: 6,
        height: 8,
        kind: TerrainFeatureKind.Cliff,
        startX: -60,
        startZ: 200,
        width: 40,
      },
    ],
    hills: [{ height: 30, width: 200, x: 350, z: 350 }],
    residual: { amplitude: 3, octaves: 2, scale: 32, seed: 1 },
  },
  { base: 9, features: [], hills: [{ height: -15, width: 120, x: -400, z: 300 }] },
  {
    base: 11,
    features: [{ falloff: 6, height: 5, kind: TerrainFeatureKind.Plateau, radius: 60, x: -100, z: -100 }],
    hills: [{ height: 22, width: 200, x: -300, z: -350 }],
  },
  { base: 14, features: [], hills: [{ height: 10, width: 70, x: 420, z: -300 }] },
];

describe(createWorldHeight, () => {
  test("raises every region no fit has drawn at its plateaus, within the heights every tile is bounded by", () => {
    expect.hasAssertions();

    const getGroundHeight = createWorldHeight(baseGrounds, regionGrounds);
    const getWindriseHeight = createWorldHeight(baseGrounds, []);
    const plateaus = regionGrounds
      .filter(({ hills }) => hills.length === 0)
      .flatMap(({ features }) => features.filter((feature) => feature.kind === TerrainFeatureKind.Plateau));
    const { maxHeight, minHeight } = createWindriseTerrainOptions(baseGrounds);

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

    const { maxHeight, minHeight } = createWindriseTerrainOptions(baseGrounds);
    const outOfBoundsGrounds = regionGrounds.filter(
      (regionGround) =>
        (regionGround.minHeight ?? minHeight) < minHeight || (regionGround.maxHeight ?? maxHeight) > maxHeight,
    );

    expect(outOfBoundsGrounds).toStrictEqual([]);
  });

  test("draws Windrise's own features as its fitted ground does", () => {
    expect.hasAssertions();

    const getGroundHeight = createWorldHeight(baseGrounds, []);
    const getWindriseHeight = createTerrainShapeHeight(...baseGrounds);
    const cliffs = baseGrounds.flatMap(({ features }) =>
      features.filter((feature) => feature.kind === TerrainFeatureKind.Cliff),
    );

    expect(cliffs).not.toHaveLength(0);

    for (const { endX, endZ, startX, startZ } of cliffs) {
      const x = (startX + endX) / 2;
      const z = (startZ + endZ) / 2;

      expect(getGroundHeight(x, z)).toBe(getWindriseHeight(x, z));
    }
  });

  test("reads heights across a quarter seam without a step", () => {
    expect.hasAssertions();

    const getGroundHeight = createWorldHeight(quarters, []);
    // A millimetre either side of each seam: the ground's slope moves a height by a few millimetres over that, so a step
    // Across the seam would show at the second decimal place
    const step = 0.001;

    for (const z of [-600, -200, 200, 600]) expect(getGroundHeight(-step, z)).toBeCloseTo(getGroundHeight(step, z), 2);
    for (const x of [-600, -200, 200, 600]) expect(getGroundHeight(x, -step)).toBeCloseTo(getGroundHeight(x, step), 2);
  });
});
