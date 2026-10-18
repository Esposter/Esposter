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
      reputationRatio: 0,
      total: 100,
    },
    {
      areaId: SECOND_AREA_ID,
      doings: [{ id: "50", kind: ExplorationKind.Waypoint, weight: 10 }],
      reputationRatio: 0,
      total: 300,
    },
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

    expect(computeNationExplorationPercentage(areas, [statue], new Set())).toBe(10);
  });

  test("liyue's percentage weighs each area by its ratio", () => {
    expect.hasAssertions();

    // The first area is 40 percent done and counts for three quarters of the nation, the second is 50 percent done and
    // Counts for a quarter, so the nation reads 42.5 percent, which rounds down to 42. Summed totals would read 47
    const ratioAreas: ExplorationArea[] = [
      {
        areaId: FIRST_AREA_ID,
        doings: [{ id: "40", kind: ExplorationKind.Waypoint, weight: 40 }],
        reputationRatio: 0.75,
        total: 100,
      },
      {
        areaId: SECOND_AREA_ID,
        doings: [{ id: "50", kind: ExplorationKind.Waypoint, weight: 150 }],
        reputationRatio: 0.25,
        total: 300,
      },
    ];
    const secondStatue: StatueLandmark = { ...statue, areaId: SECOND_AREA_ID };

    expect(computeNationExplorationPercentage(ratioAreas, [statue, secondStatue], new Set())).toBe(42);
  });

  test("a whole share reads whole when its ratio is a float that multiplies just under it", () => {
    expect.hasAssertions();

    // Zero point five seven times a hundred is 56.99999999999999 in doubles, so the one area's share is 57, not 56
    const floatAreas: ExplorationArea[] = [
      {
        areaId: FIRST_AREA_ID,
        doings: [{ id: "40", kind: ExplorationKind.Waypoint, weight: 100 }],
        reputationRatio: 0.57,
        total: 100,
      },
    ];

    expect(computeNationExplorationPercentage(floatAreas, [statue], new Set())).toBe(57);
  });

  test("should read zero while no statue is unlocked", () => {
    expect.hasAssertions();

    expect(computeNationExplorationPercentage(areas, [], new Set())).toBe(0);
  });
});
