import type { GcgChallengerGame } from "#src/models/gcg/GcgChallengerGame";

import { listGcgOpenGameIds } from "#src/services/gcg/listGcgOpenGameIds";
import { describe, expect, test } from "vitest";

describe(listGcgOpenGameIds, () => {
  const CHALLENGER_GAMES: GcgChallengerGame[] = [
    { gameId: 1, level: 1 },
    { gameId: 2, level: 3 },
    { gameId: 3, level: 5 },
  ];

  test("a game opens once the Player Level reaches its level", () => {
    expect.hasAssertions();

    expect(listGcgOpenGameIds(CHALLENGER_GAMES, 3)).toStrictEqual([1, 2]);
  });

  test("a game above the Player Level is not offered", () => {
    expect.hasAssertions();

    expect(listGcgOpenGameIds(CHALLENGER_GAMES, 2)).toStrictEqual([1]);
  });
});
