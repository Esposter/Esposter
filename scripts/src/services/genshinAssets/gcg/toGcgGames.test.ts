import type { ExcelGcgGameRow } from "#src/models/genshinAssets/gcg/ExcelGcgGameRow";

import { GCG_PLACEHOLDER_PLAYER_DECK_ID } from "#src/services/genshinAssets/gcg/constants";
import { toGcgGames } from "#src/services/genshinAssets/gcg/toGcgGames";
import { describe, expect, test } from "vitest";

const gameRows: ExcelGcgGameRow[] = [
  { cardGroupId: 2, enemyCardGroupId: 1, id: 12, ruleId: 2 },
  { cardGroupId: 3, enemyCardGroupId: 4, id: 13, ruleId: 2 },
];

describe("toGcgGames", () => {
  test("should name the placeholder deck for a player's deck no slice is written for", () => {
    expect.hasAssertions();

    expect(toGcgGames(gameRows, [12], [1, 3, 4])).toStrictEqual({
      12: { enemyDeckId: 1, gamePlayerDeckId: 2, playerDeckId: GCG_PLACEHOLDER_PLAYER_DECK_ID },
    });
  });

  test("should play the game's own player deck where a slice is written for it", () => {
    expect.hasAssertions();

    expect(toGcgGames(gameRows, [13], [1, 3, 4])).toStrictEqual({
      13: { enemyDeckId: 4, gamePlayerDeckId: 3, playerDeckId: 3 },
    });
  });

  test("should throw for an opponent's deck no slice is written for", () => {
    expect.hasAssertions();

    expect(() => toGcgGames(gameRows, [12], [3])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: game, game 12 plays deck 1, which no slice is written for]`,
    );
  });
});
