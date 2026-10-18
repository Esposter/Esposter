import type { GcgPlayerLevel } from "#src/models/gcg/GcgPlayerLevel";

import { computeGcgPlayerLevel } from "#src/services/gcg/computeGcgPlayerLevel";
import { describe, expect, test } from "vitest";

describe(computeGcgPlayerLevel, () => {
  // Made-up levels: level one from no EXP, then the total EXP each level reaches
  const PLAYER_LEVELS: GcgPlayerLevel[] = [
    { exp: 0, level: 1 },
    { exp: 300, level: 2 },
    { exp: 1050, level: 3 },
  ];

  test("the Player Level follows the game's level table", () => {
    expect.hasAssertions();

    expect([0, 299, 300, 1049, 1050, 9999].map((exp) => computeGcgPlayerLevel(exp, PLAYER_LEVELS, true))).toStrictEqual(
      [1, 1, 2, 2, 3, 3],
    );
  });

  test("finishing the tutorial quest starts the Player Level at one", () => {
    expect.hasAssertions();

    expect(
      [false, true].map((isTutorialQuestFinished) => computeGcgPlayerLevel(0, PLAYER_LEVELS, isTutorialQuestFinished)),
    ).toStrictEqual([0, 1]);
  });
});
