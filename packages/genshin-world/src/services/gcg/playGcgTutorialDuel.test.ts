import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { advanceGcgOpponent } from "#src/services/gcg/advanceGcgOpponent";
import { createGcgDuel } from "#src/services/gcg/createGcgDuel";
import { prepareGcgSide } from "#src/services/gcg/prepareGcgSide";
import { readGcgDeck } from "#src/services/gcg/readGcgDeck";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { createSeededRandom } from "genshin-engine";
import { describe, expect, test } from "vitest";

const TEST_RULE = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);

// Plays a duel between two decks through the scripted policy each side takes its turns by, until its phase ends or the
// Step limit is reached
const playGcgDuel = (decks: Parameters<typeof createGcgDuel>[0], rule: GcgDuel["rule"]): GcgDuel => {
  const SEED = 7;
  const MAX_STEPS = 2000;
  const random = createSeededRandom(SEED);
  const duel = createGcgDuel(decks, random, rule);
  for (const sideIndex of [0, 1]) prepareGcgSide(duel, sideIndex, [], 0);
  for (let step = 0; step < MAX_STEPS && duel.phase !== GcgPhase.Ended; step++)
    for (const sideIndex of [0, 1]) advanceGcgOpponent(duel, sideIndex);
  return duel;
};

describe("the duels a player meets, each between two decks read from the game data", () => {
  // The tutorial deck against itself, the opponent decks 3 and 4, the tutorial's opponent decks 30111 and 30112, the
  // player's deck 7 against opponent deck 30111, the Oceanid's deck 2, and the Mondstadt challengers' decks 11005 and 11002
  test.each([
    [1, 1],
    [3, 4],
    [30_111, 30_112],
    [7, 30_111],
    [1, 2],
    [1, 11_005],
    [1, 11_002],
  ])("the duel between decks %i and %i should be played to its end", async (firstDeckId, secondDeckId) => {
    expect.hasAssertions();

    const duel = playGcgDuel(
      [
        await readGcgDeck(GAME_DATA_LOCAL_BASE_URL, firstDeckId),
        await readGcgDeck(GAME_DATA_LOCAL_BASE_URL, secondDeckId),
      ],
      TEST_RULE,
    );

    expect({ hasOutcome: duel.outcome !== undefined, isEnded: duel.phase === GcgPhase.Ended }).toStrictEqual({
      hasOutcome: true,
      isEnded: true,
    });
  });
});
