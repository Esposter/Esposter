import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";
import type { StatueLandmark } from "#src/models/world/StatueLandmark";
import type { StatueOfTheNewMoonLandmark } from "#src/models/world/StatueOfTheNewMoonLandmark";

import { ExplorationKind } from "#src/models/exploration/ExplorationKind";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { computeExplorationProgress } from "#src/services/exploration/computeExplorationProgress";
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

    expect(computeExploredDoingIds(area, [], new Set())).toStrictEqual(new Set());
  });

  test("should name the area's waypoint once its statue is unlocked, and no chest", () => {
    expect.hasAssertions();

    expect(computeExploredDoingIds(area, [statue], new Set())).toStrictEqual(new Set([WAYPOINT_ID]));
  });

  test("a discovered Statue of the New Moon is the area's waypoint too", () => {
    expect.hasAssertions();

    const newMoonStatue: StatueOfTheNewMoonLandmark = {
      areaId: AREA_ID,
      arrival: { heightOffset: 0, position: { x: 0, z: 0 }, rotation: 0 },
      heightOffset: 0,
      id: "",
      kind: LandmarkKind.StatueOfTheNewMoon,
      position: { x: 0, z: 0 },
      rotation: 0,
    };

    expect(computeExploredDoingIds(area, [newMoonStatue], new Set())).toStrictEqual(new Set([WAYPOINT_ID]));
  });

  test("a doing repeated adds its weight only once", () => {
    expect.hasAssertions();

    // The waypoint's ten of the area's 146 reads six percent, however many times its statue is counted
    expect([
      computeExplorationProgress(area, computeExploredDoingIds(area, [statue], new Set())),
      computeExplorationProgress(area, computeExploredDoingIds(area, [statue, statue], new Set())),
    ]).toStrictEqual([6, 6]);
  });
});
