import { GcgDeckIdCreatedCardIdsMap } from "#src/services/genshinAssets/gcg/constants";
import { describe, expect, test } from "vitest";

describe("early opponent decks", () => {
  // The decks the first opponents play, which the generator builds ahead of the rest. Production keys
  // GcgDeckIdCreatedCardIdsMap by these ids, so the test has to name the same ones and cannot use made-up ones
  const EARLY_OPPONENT_DECK_IDS: number[] = [30_112, 30_111, 11_002, 11_005];
  // The player's deck the tutorial duel names, which the generator builds beside the opponents' decks
  const TUTORIAL_PLAYER_DECK_ID = 7;

  test("should pin each first opponent's deck the generator builds, and none it does not", () => {
    expect.hasAssertions();

    expect(EARLY_OPPONENT_DECK_IDS.filter((deckId) => GcgDeckIdCreatedCardIdsMap.has(deckId))).toStrictEqual(
      EARLY_OPPONENT_DECK_IDS,
    );
  });

  test("should build the player's deck the tutorial duel names", () => {
    expect.hasAssertions();

    expect(GcgDeckIdCreatedCardIdsMap.has(TUTORIAL_PLAYER_DECK_ID)).toBe(true);
  });
});
