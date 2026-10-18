import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";
import type { ChestPlace } from "#src/models/chest/ChestPlace";
import type { CatalogueArea } from "#src/models/world/CatalogueArea";
import type { StatueLandmark } from "#src/models/world/StatueLandmark";

import { ChestKind } from "#src/models/chest/ChestKind";
import { ExplorationKind } from "#src/models/exploration/ExplorationKind";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { computeExplorationProgress } from "#src/services/exploration/computeExplorationProgress";
import { computeOpenedChestCountMap } from "#src/services/chest/computeOpenedChestCountMap";
import { computeExploredDoingIds } from "#src/services/exploration/computeExploredDoingIds";
import { describe, expect, test } from "vitest";

describe(computeExploredDoingIds, () => {
  const AREA_ID = "galesong-hill";
  const WAYPOINT_ID = "40";
  const CHEST_ID = "41";
  const area: ExplorationArea = {
    areaId: AREA_ID,
    doings: [
      { id: WAYPOINT_ID, kind: ExplorationKind.Waypoint, weight: 10 },
      { id: CHEST_ID, kind: ExplorationKind.Chest, weight: 10 },
    ],
    reputationRatio: 0,
    total: 146,
  };
  const statue: StatueLandmark = {
    areaId: AREA_ID,
    heightOffset: 0,
    id: "",
    kind: LandmarkKind.StatueOfTheSeven,
    position: { x: 0, z: 0 },
    rotation: 0,
  };

  test("should name no doing while the area's statue is locked", () => {
    expect.hasAssertions();

    expect(computeExploredDoingIds(area, [])).toStrictEqual(new Set());
  });

  test("should name the area's waypoint once its statue is unlocked, and no chest", () => {
    expect.hasAssertions();

    expect(computeExploredDoingIds(area, [statue])).toStrictEqual(new Set([WAYPOINT_ID]));
  });

  test("an opened chest counts once toward its area's exploration", () => {
    expect.hasAssertions();

    expect(computeExploredDoingIds(area, [], 1)).toStrictEqual(new Set([CHEST_ID]));
  });

  test("reopening a chest adds nothing to the count", () => {
    expect.hasAssertions();

    // The count is taken over the set of opened chests, which holds one record of a chest however often it is opened
    const areas: Pick<CatalogueArea, "id" | "outline">[] = [
      {
        id: AREA_ID,
        outline: [
          { x: 0, z: 0 },
          { x: 10, z: 0 },
          { x: 10, z: 10 },
          { x: 0, z: 10 },
        ],
      },
    ];
    const chestPlaces: ChestPlace[] = [{ id: "chest-inside", kind: ChestKind.Common, position: { x: 5, z: 5 } }];
    const openedChestCountMap = computeOpenedChestCountMap(areas, chestPlaces, new Set(["chest-inside"]));

    expect(computeExploredDoingIds(area, [], openedChestCountMap.get(AREA_ID))).toStrictEqual(new Set([CHEST_ID]));
  });

  test("a doing repeated adds its weight only once", () => {
    expect.hasAssertions();

    // The waypoint's ten of the area's 146 reads six percent, however many times its statue is counted
    expect([
      computeExplorationProgress(area, computeExploredDoingIds(area, [statue])),
      computeExplorationProgress(area, computeExploredDoingIds(area, [statue, statue])),
    ]).toStrictEqual([6, 6]);
  });
});
