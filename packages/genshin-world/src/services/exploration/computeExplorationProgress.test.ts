import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";

import { ExplorationKind } from "#src/models/exploration/ExplorationKind";
import { computeExplorationProgress } from "#src/services/exploration/computeExplorationProgress";
import { describe, expect, test } from "vitest";

describe(computeExplorationProgress, () => {
  const WEIGHT = 10;
  const TOTAL = 146;
  const area: ExplorationArea = {
    areaId: "galesong-hill",
    doings: [
      { id: "40", kind: ExplorationKind.Waypoint, weight: WEIGHT },
      { id: "41", kind: ExplorationKind.Chest, weight: WEIGHT },
      { id: "42", kind: ExplorationKind.Camp, weight: WEIGHT },
    ],
    total: TOTAL,
  };

  test("should count the doings done out of those counted, and floor the done weight's share of the total", () => {
    expect.hasAssertions();

    expect(computeExplorationProgress(area, new Set(["40"]))).toStrictEqual({
      doingCount: 3,
      doneCount: 1,
      percentage: Math.floor((WEIGHT * 100) / TOTAL),
    });
  });
});
