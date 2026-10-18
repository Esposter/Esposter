import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";
import type { StatueLandmark } from "#src/models/world/StatueLandmark";

import { ExplorationKind } from "#src/models/exploration/ExplorationKind";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { computeNationExplorationPercentage } from "#src/services/exploration/computeNationExplorationPercentage";
import { describe, expect, test } from "vitest";

describe(computeNationExplorationPercentage, () => {
  const WAYPOINT_WEIGHT = 40;
  const FIRST_AREA_ID = "first-area";
  const SECOND_AREA_ID = "second-area";
  const areas: ExplorationArea[] = [
    {
      areaId: FIRST_AREA_ID,
      doings: [{ id: "40", kind: ExplorationKind.Waypoint, weight: WAYPOINT_WEIGHT }],
      total: 100,
    },
    { areaId: SECOND_AREA_ID, doings: [{ id: "50", kind: ExplorationKind.Waypoint, weight: 10 }], total: 300 },
  ];
  const statue: StatueLandmark = {
    areaId: FIRST_AREA_ID,
    heightOffset: 0,
    id: "",
    kind: LandmarkKind.StatueOfTheSeven,
    position: { x: 0, z: 0 },
    rotation: 0,
  };

  test("mondstadt's percentage uses summed totals when every ratio is zero", () => {
    expect.hasAssertions();

    expect(computeNationExplorationPercentage(areas, [statue])).toBe(10);
  });

  test("should read zero while no statue is unlocked", () => {
    expect.hasAssertions();

    expect(computeNationExplorationPercentage(areas, [])).toBe(0);
  });
});
