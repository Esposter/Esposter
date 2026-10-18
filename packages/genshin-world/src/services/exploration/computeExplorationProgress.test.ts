import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";

import { ExplorationKind } from "#src/models/exploration/ExplorationKind";
import { computeExplorationProgress } from "#src/services/exploration/computeExplorationProgress";
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

  test("a near-complete area reads below 100", () => {
    expect.hasAssertions();

    // A done weight of 199 of a total of 200 is 99.5 percent, which rounds down to 99 rather than reading complete
    expect(
      computeExplorationProgress(
        { doings: [{ id: "40", kind: ExplorationKind.Waypoint, weight: 199 }], total: 200 },
        new Set(["40"]),
      ),
    ).toBe(99);
  });

  test("should read zero for an area with no total, not divide by it", () => {
    expect.hasAssertions();

    expect(computeExplorationProgress({ doings: [], total: 0 }, new Set())).toBe(0);
  });
});
