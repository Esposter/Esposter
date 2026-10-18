import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";
import type { AbyssPeriod } from "#src/models/spiralAbyss/AbyssPeriod";

import { ABYSS_CORRIDOR_CYCLE_KEY } from "#src/services/spiralAbyss/constants";
import { getAbyssCycleKey } from "#src/services/spiralAbyss/getAbyssCycleKey";
import { describe, expect, test } from "vitest";

describe(getAbyssCycleKey, () => {
  const CORRIDOR_FLOOR: AbyssFloor = { chambers: [], id: 1, index: 1, teamCount: 1, unlockStarCount: 6 };
  const MOON_SPIRE_FLOOR: AbyssFloor = { chambers: [], id: 9, index: 9, teamCount: 1, unlockStarCount: 6 };
  const PERIOD: AbyssPeriod = {
    blessing: { descriptionTextHash: 0, icon: "UI_TowerBlessing_107", nameTextHash: 0 },
    closesAt: new Date(0).toISOString(),
    floorIds: [9],
    id: 124,
    rewardGroup: 1,
    startsAt: new Date(0).toISOString(),
  };

  test("a Corridor floor is kept in the one cycle that never resets, whatever period is open", () => {
    expect.hasAssertions();

    expect(getAbyssCycleKey(CORRIDOR_FLOOR, undefined)).toBe(ABYSS_CORRIDOR_CYCLE_KEY);
    expect(getAbyssCycleKey(CORRIDOR_FLOOR, PERIOD)).toBe(ABYSS_CORRIDOR_CYCLE_KEY);
  });

  test("a Moon Spire floor is kept in the cycle of the period it is fought in", () => {
    expect.hasAssertions();

    expect(getAbyssCycleKey(MOON_SPIRE_FLOOR, PERIOD)).toBe(String(PERIOD.id));
  });

  test("a Moon Spire floor with no period has no cycle to keep its progress in", () => {
    expect.hasAssertions();

    expect(getAbyssCycleKey(MOON_SPIRE_FLOOR, undefined)).toBeUndefined();
  });
});
