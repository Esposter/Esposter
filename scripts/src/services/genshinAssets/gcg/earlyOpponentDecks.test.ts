import { GcgDeckIdCreatedCardIdsMap } from "#src/services/genshinAssets/gcg/constants";
import { describe, expect, test } from "vitest";

// The deck each first opponent plays, read from the dump's duel rows. The tutorial quest's duels are the GCGQuestLevel rows
// 30111 ("Duel: Sucrose") and 30112 ("Duel: Fischl"), each game's enemy card group naming its deck. The Mondstadt challengers
// Marjorie and Ellin open at Genius Invokation level 0 and first duel at level 1, in games 1021 and 1031
const EARLY_OPPONENT_DECK_IDS = new Map<string, number>([
  ["Duel: Fischl", 30_112],
  ["Duel: Sucrose", 30_111],
  ["Guest Challenge: Ellin", 11_002],
  ["Guest Challenge: Marjorie", 11_005],
]);

describe("early opponent decks", () => {
  test("should name each first opponent's deck, and none of them one the generator builds", () => {
    expect.hasAssertions();

    expect(
      [...EARLY_OPPONENT_DECK_IDS.values()].filter((deckId) => GcgDeckIdCreatedCardIdsMap.has(deckId)),
    ).toStrictEqual([]);
  });
});
