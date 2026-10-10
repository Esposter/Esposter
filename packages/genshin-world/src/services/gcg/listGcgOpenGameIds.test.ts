import type { GcgChallengerGame } from "#src/models/gcg/GcgChallengerGame";

import { listGcgOpenGameIds } from "#src/services/gcg/listGcgOpenGameIds";
import { describe, expect, test } from "vitest";

describe(listGcgOpenGameIds, () => {
  const CHALLENGER_GAMES: GcgChallengerGame[] = [
    { gameId: 1, level: 1 },
    { gameId: 2, level: 3 },
    { gameId: 3, level: 5 },
  ];

  test("should open the duels whose level the Player Level has reached, and no later one", () => {
    expect.hasAssertions();

    expect(listGcgOpenGameIds(CHALLENGER_GAMES, 3)).toStrictEqual([1, 2]);
  });
});
