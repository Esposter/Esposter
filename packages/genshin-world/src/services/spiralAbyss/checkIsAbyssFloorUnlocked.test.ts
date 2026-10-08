import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";
import type { AbyssProgress } from "#src/models/spiralAbyss/AbyssProgress";

import { checkIsAbyssFloorUnlocked } from "#src/services/spiralAbyss/checkIsAbyssFloorUnlocked";
import { describe, expect, test } from "vitest";

const makeProgress = (stars: number): AbyssProgress => ({
  chamberIdProgressMap: new Map([
    [1, { isCleared: true, stars }],
    [2, { isCleared: true, stars: 0 }],
    [3, { isCleared: true, stars: 0 }],
  ]),
  claimedRewardIds: new Set(),
});

describe(checkIsAbyssFloorUnlocked, () => {
  const UNLOCK_STAR_COUNT = 6;
  const floor: AbyssFloor = {
    chambers: [
      { conditions: [], id: 1, index: 1 },
      { conditions: [], id: 2, index: 2 },
      { conditions: [], id: 3, index: 3 },
    ],
    id: 1,
    index: 1,
    teamCount: 1,
    unlockStarCount: UNLOCK_STAR_COUNT,
  };

  test("should open the first floor, which has none below it", () => {
    expect.hasAssertions();

    expect(checkIsAbyssFloorUnlocked(undefined, makeProgress(0))).toBe(true);
  });

  test("should open the floor above once the floor below holds its unlock count of stars", () => {
    expect.hasAssertions();

    expect(checkIsAbyssFloorUnlocked(floor, makeProgress(UNLOCK_STAR_COUNT - 1))).toBe(false);
    expect(checkIsAbyssFloorUnlocked(floor, makeProgress(UNLOCK_STAR_COUNT))).toBe(true);
  });

  test("should keep the floor above locked while a chamber below is not cleared", () => {
    expect.hasAssertions();

    const progress = makeProgress(UNLOCK_STAR_COUNT);
    progress.chamberIdProgressMap.set(3, { isCleared: false, stars: 0 });

    expect(checkIsAbyssFloorUnlocked(floor, progress)).toBe(false);
  });
});
