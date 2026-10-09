import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";
import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";

import { AbyssStarConditionKind } from "#src/models/spiralAbyss/AbyssStarConditionKind";
import { ABYSS_MONOLITH_FULL_PERCENT, ABYSS_SHORT_CLOCK_SECONDS } from "#src/services/spiralAbyss/constants";
import { createAbyssChallenge } from "#src/services/spiralAbyss/createAbyssChallenge";
import { describe, expect, test } from "vitest";

describe(createAbyssChallenge, () => {
  const TEAM_COUNT = 2;
  const floor: AbyssFloor = { chambers: [], id: 1, index: 1, teamCount: TEAM_COUNT, unlockStarCount: 6 };
  const chamber: AbyssChamber = {
    conditions: [{ kind: AbyssStarConditionKind.LeftTime, threshold: 90 }],
    id: 1,
    index: 1,
  };

  test("should start a chamber's clock at its floor's seconds with one team per half", () => {
    expect.hasAssertions();

    expect(createAbyssChallenge(floor, chamber)).toStrictEqual({
      defeatedHalfCount: 0,
      halfCount: TEAM_COUNT,
      monolithPercent: undefined,
      secondsLeft: ABYSS_SHORT_CLOCK_SECONDS,
    });
  });

  test("should start a chamber with a monolith at full health", () => {
    expect.hasAssertions();

    const monolithChamber: AbyssChamber = {
      ...chamber,
      conditions: [{ kind: AbyssStarConditionKind.MonolithHealth, threshold: 20 }],
    };

    expect(createAbyssChallenge(floor, monolithChamber).monolithPercent).toBe(ABYSS_MONOLITH_FULL_PERCENT);
  });
});
