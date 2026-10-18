import type { WorldArea } from "#src/models/genshinAssets/world/WorldArea";

import { WorldAreaType } from "#src/models/genshinAssets/world/WorldAreaType";
import { toCatalogueAreaPlaceMap } from "#src/services/genshinAssets/domains/toCatalogueAreaPlaceMap";
import { OPEN_WORLD_SCENE_ID } from "#src/services/genshinAssets/shared/constants";
import { describe, expect, test } from "vitest";

const regions = [
  { areas: [{ id: "starfell-valley", name: "Starfell Valley" }], id: "mondstadt" },
  { areas: [{ id: "bishui-plain", name: "Bishui Plain" }], id: "liyue" },
];
const textMap = new Map([
  ["1", "Starfell Valley"],
  ["2", "Bishui Plain"],
  ["3", "Unlisted"],
]);
const createArea = (
  overrides: Partial<Pick<WorldArea, "areaID1" | "areaNameTextMapHash" | "areaType" | "sceneID">>,
): Pick<WorldArea, "areaID1" | "areaNameTextMapHash" | "areaType" | "sceneID"> => ({
  areaID1: 1,
  areaNameTextMapHash: 1,
  areaType: WorldAreaType.Level1,
  sceneID: OPEN_WORLD_SCENE_ID,
  ...overrides,
});

describe(toCatalogueAreaPlaceMap, () => {
  test("a level-one area is mapped to the catalogue area of its English name and the region holding it", () => {
    expect.hasAssertions();

    expect(
      toCatalogueAreaPlaceMap({
        areas: [createArea({}), createArea({ areaID1: 5, areaNameTextMapHash: 2 })],
        regions,
        textMap,
      }),
    ).toStrictEqual(
      new Map([
        [1, { areaId: "starfell-valley", region: "mondstadt" }],
        [5, { areaId: "bishui-plain", region: "liyue" }],
      ]),
    );
  });

  test("a level-two area, an area of another scene and an area the catalogue holds no name of are left out", () => {
    expect.hasAssertions();

    expect(
      toCatalogueAreaPlaceMap({
        areas: [
          createArea({ areaID1: 5, areaNameTextMapHash: 2, areaType: WorldAreaType.Level2 }),
          createArea({ areaID1: 6, areaNameTextMapHash: 2, sceneID: OPEN_WORLD_SCENE_ID + 1 }),
          createArea({ areaID1: 7, areaNameTextMapHash: 3 }),
        ],
        regions,
        textMap,
      }),
    ).toStrictEqual(new Map());
  });
});
