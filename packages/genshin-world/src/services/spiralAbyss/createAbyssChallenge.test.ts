import type { PartyTeam } from "#src/models/party/PartyTeam";
import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";
import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";

import { AbyssStarConditionKind } from "#src/models/spiralAbyss/AbyssStarConditionKind";
import { ABYSS_MONOLITH_FULL_PERCENT, ABYSS_SHORT_CLOCK_SECONDS } from "#src/services/spiralAbyss/constants";
import { createAbyssChallenge } from "#src/services/spiralAbyss/createAbyssChallenge";
import { describe, expect, test } from "vitest";

describe(createAbyssChallenge, () => {
  const TEAM_COUNT = 2;
  const FIRST_TEAM: PartyTeam = { characterIds: [1], name: "" };
  const SECOND_TEAM: PartyTeam = { characterIds: [2], name: "" };
  const PARTY_SET = [FIRST_TEAM, SECOND_TEAM];
  const floor: AbyssFloor = { chambers: [], id: 1, index: 1, teamCount: TEAM_COUNT, unlockStarCount: 6 };
  const chamber: AbyssChamber = {
    conditions: [{ kind: AbyssStarConditionKind.LeftTime, threshold: 90 }],
    halfMonsterDescribeIds: [],
    id: 1,
    index: 1,
  };

  test("a chamber is entered with the party set", () => {
    expect.hasAssertions();

    expect(createAbyssChallenge(floor, chamber, PARTY_SET)).toStrictEqual({
      defeatedHalfCount: 0,
      halfCount: TEAM_COUNT,
      monolithPercent: undefined,
      secondsLeft: ABYSS_SHORT_CLOCK_SECONDS,
    });
  });

  test("a chamber cannot be entered without a party", () => {
    expect.hasAssertions();

    expect(createAbyssChallenge(floor, chamber, [])).toBeUndefined();
    expect(createAbyssChallenge(floor, chamber, [FIRST_TEAM])).toBeUndefined();
    expect(createAbyssChallenge(floor, chamber, [FIRST_TEAM, { characterIds: [], name: "" }])).toBeUndefined();
  });

  test("a character cannot be in both teams of a chamber", () => {
    expect.hasAssertions();

    expect(createAbyssChallenge(floor, chamber, [FIRST_TEAM, { characterIds: [1], name: "" }])).toBeUndefined();
  });

  test("should start a chamber with a monolith at full health", () => {
    expect.hasAssertions();

    const monolithChamber: AbyssChamber = {
      ...chamber,
      conditions: [{ kind: AbyssStarConditionKind.MonolithHealth, threshold: 20 }],
    };

    expect(createAbyssChallenge(floor, monolithChamber, PARTY_SET)?.monolithPercent).toBe(ABYSS_MONOLITH_FULL_PERCENT);
  });
});
