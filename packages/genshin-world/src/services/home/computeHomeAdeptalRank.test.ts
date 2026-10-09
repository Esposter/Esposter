import type { HomeComfortLevel } from "#src/models/home/HomeComfortLevel";

import { computeHomeAdeptalRank } from "#src/services/home/computeHomeAdeptalRank";
import { describe, expect, test } from "vitest";

describe(computeHomeAdeptalRank, () => {
  const SECOND_RANK_COMFORT = 2000;
  const levels: HomeComfortLevel[] = [
    { bountyRate: 0, coinRate: 0, comfort: 0, level: 1 },
    { bountyRate: 0, coinRate: 0, comfort: SECOND_RANK_COMFORT, level: 2 },
  ];

  test("should read the rank whose comfort the realm reaches, and the first rank below it", () => {
    expect.hasAssertions();

    expect(computeHomeAdeptalRank(SECOND_RANK_COMFORT - 1, levels)).toBe(1);
    expect(computeHomeAdeptalRank(SECOND_RANK_COMFORT, levels)).toBe(2);
  });
});
