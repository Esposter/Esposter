import { GcgDeckIdCreatedCardIdsMap } from "#src/services/genshinAssets/gcg/constants";
import { describe, expect, test } from "vitest";

describe("early opponent decks", () => {
  // The deck each first opponent plays, read from the dump's duel rows. The tutorial quest's duels are the GCGQuestLevel rows
  // 30111 ("Duel: Sucrose") and 30112 ("Duel: Fischl"), each game's enemy card group naming its deck. The Mondstadt challengers
  // Marjorie and Ellin open at Genius Invokation level 0 and first duel at level 1, in games 1021 and 1031
  const EARLY_OPPONENT_DECK_IDS = new Map<string, number>([
    ["Duel: Fischl", 30_112],
    ["Duel: Sucrose", 30_111],
    ["Guest Challenge: Ellin", 11_002],
    ["Guest Challenge: Marjorie", 11_005],
  ]);
  // The player's deck the tutorial's Sucrose duel names in its game row, game 30111's card group
  const TUTORIAL_PLAYER_DECK_ID = 7;

  test("should pin each first opponent's deck the generator builds, and none it does not", () => {
    expect.hasAssertions();

    expect(
      [...EARLY_OPPONENT_DECK_IDS.values()].filter((deckId) => GcgDeckIdCreatedCardIdsMap.has(deckId)),
    ).toStrictEqual([30_112, 30_111, 11_002, 11_005]);
  });

  test("should build the player's deck the tutorial duel names", () => {
    expect.hasAssertions();

    expect(GcgDeckIdCreatedCardIdsMap.has(TUTORIAL_PLAYER_DECK_ID)).toBe(true);
  });
});
