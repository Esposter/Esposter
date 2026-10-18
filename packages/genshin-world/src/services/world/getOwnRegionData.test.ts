import type { LoadedRegion } from "#src/models/world/LoadedRegion";
import type { SceneExport } from "#src/models/scene/SceneExport";

import { getOwnRegionData } from "#src/services/world/getOwnRegionData";
import { describe, expect, test } from "vitest";

const createRegion = (id: string): LoadedRegion => ({
  enemyCamps: [],
  goToPlaces: [],
  id,
  landmarks: [],
  outcropPlaces: [],
  regionPalettes: {},
  residents: [],
  rivers: [],
  waterfalls: [],
});

describe(getOwnRegionData, () => {
  test("a region the game's export stands in draws no river or fall of its own", () => {
    expect.hasAssertions();

    const liyue = createRegion("liyue");
    const mondstadt = createRegion("mondstadt");
    const sceneExportMap = new Map<string, SceneExport>([["liyue", {} as SceneExport]]);

    expect(
      getOwnRegionData(
        new Map([
          ["liyue", liyue],
          ["mondstadt", mondstadt],
        ]),
        sceneExportMap,
      ),
    ).toStrictEqual([mondstadt]);
  });
});
