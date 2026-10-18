import type { GcgLevelLock } from "#src/models/gcg/GcgLevelLock";
import type { GcgPlayerLevel } from "#src/models/gcg/GcgPlayerLevel";

import { computeGcgPlayerLevel } from "#src/services/gcg/computeGcgPlayerLevel";
import { describe, expect, test } from "vitest";

describe(computeGcgPlayerLevel, () => {
  // Made-up levels: level one from no EXP, then the total EXP each level reaches
  const PLAYER_LEVELS: GcgPlayerLevel[] = [
    { exp: 0, level: 1 },
    { exp: 300, level: 2 },
    { exp: 1050, level: 3 },
    { exp: 2000, level: 4 },
    { exp: 3000, level: 5 },
  ];
  // Made-up quests, each passing the lock at the level the game gates it at
  const LOCKS: GcgLevelLock[] = [
    { unlockLevel: 2, unlockMainQuestId: "a" },
    { unlockLevel: 4, unlockMainQuestId: "b" },
  ];

  test("the Player Level follows the game's level table", () => {
    expect.hasAssertions();

    expect(
      [0, 299, 300, 1049, 1050, 1999, 2000, 9999].map((exp) =>
        computeGcgPlayerLevel(exp, PLAYER_LEVELS, true, [], new Set()),
      ),
    ).toStrictEqual([1, 1, 2, 2, 3, 3, 4, 5]);
  });

  test("finishing the tutorial quest starts the Player Level at one", () => {
    expect.hasAssertions();

    expect(
      [false, true].map((isTutorialQuestFinished) =>
        computeGcgPlayerLevel(0, PLAYER_LEVELS, isTutorialQuestFinished, [], new Set()),
      ),
    ).toStrictEqual([0, 1]);
  });

  test.each([
    [1050, new Set<string>(), 2],
    [1050, new Set(["a"]), 3],
    [2000, new Set(["a"]), 4],
    [3000, new Set(["a"]), 4],
    [3000, new Set(["a", "b"]), 5],
  ])("a lock holds the Player Level at its level until its main quest is done", (exp, completedMainQuestIds, level) => {
    expect.hasAssertions();

    expect(computeGcgPlayerLevel(exp, PLAYER_LEVELS, true, LOCKS, completedMainQuestIds)).toBe(level);
  });
});
