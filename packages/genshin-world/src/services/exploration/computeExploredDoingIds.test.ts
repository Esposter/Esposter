import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";
import type { StatueLandmark } from "#src/models/world/StatueLandmark";

import { ExplorationKind } from "#src/models/exploration/ExplorationKind";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
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
    total: 146,
  };

  test("should name no doing while the area's statue is locked", () => {
    expect.hasAssertions();

    expect(computeExploredDoingIds(area, [])).toStrictEqual(new Set());
  });

  test("should name the area's waypoint once its statue is unlocked, and no chest", () => {
    expect.hasAssertions();

    const statue: StatueLandmark = {
      areaId: AREA_ID,
      heightOffset: 0,
      id: "",
      kind: LandmarkKind.StatueOfTheSeven,
      position: { x: 0, z: 0 },
      rotation: 0,
    };

    expect(computeExploredDoingIds(area, [statue])).toStrictEqual(new Set([WAYPOINT_ID]));
  });
});
