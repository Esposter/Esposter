import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";
import type { StatueLandmark } from "#src/models/world/StatueLandmark";

import { ExplorationKind } from "#src/models/exploration/ExplorationKind";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { computeExplorationProgress } from "#src/services/exploration/computeExplorationProgress";
import { computeExploredDoingIds } from "#src/services/exploration/computeExploredDoingIds";
import { describe, expect, test } from "vitest";

describe(computeExplorationProgress, () => {
  const WEIGHT = 10;
  const TOTAL = 15;
  const area: ExplorationArea = {
    areaId: "galesong-hill",
    doings: [
      { id: "40", kind: ExplorationKind.Waypoint, weight: WEIGHT },
      { id: "41", kind: ExplorationKind.Chest, weight: WEIGHT },
    ],
    reputationRatio: 0,
    total: TOTAL,
  };

  test("should floor the done weight's share of the total", () => {
    expect.hasAssertions();

    expect(computeExplorationProgress(area, new Set(["40"]))).toBe(Math.floor((WEIGHT * 100) / TOTAL));
  });

  test("should read 100 once the done weight passes the total", () => {
    expect.hasAssertions();

    expect(computeExplorationProgress(area, new Set(["40", "41"]))).toBe(100);
  });

  test("should read zero for an area with no total, not divide by it", () => {
    expect.hasAssertions();

    expect(computeExplorationProgress({ doings: [], total: 0 }, new Set())).toBe(0);
  });

  test("a near-complete area reads below 100", () => {
    expect.hasAssertions();

    const nearComplete: Pick<ExplorationArea, "doings" | "total"> = {
      doings: [{ id: "40", kind: ExplorationKind.Waypoint, weight: 199 }],
      total: 200,
    };

    expect(computeExplorationProgress(nearComplete, new Set(["40"]))).toBe(99);
  });

  test("a doing repeated adds its weight only once", () => {
    expect.hasAssertions();

    const statue: StatueLandmark = {
      areaId: area.areaId,
      heightOffset: 0,
      id: "statue",
      kind: LandmarkKind.StatueOfTheSeven,
      position: { x: 0, z: 0 },
      rotation: 0,
    };

    expect(computeExplorationProgress(area, computeExploredDoingIds(area, [statue, statue]))).toBe(
      Math.floor((WEIGHT * 100) / TOTAL),
    );
  });
});
