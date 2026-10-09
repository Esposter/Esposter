import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { advanceGcgOpponent } from "#src/services/gcg/advanceGcgOpponent";
import { createGcgDuel } from "#src/services/gcg/createGcgDuel";
import { prepareGcgSide } from "#src/services/gcg/prepareGcgSide";
import { readGcgDeck } from "#src/services/gcg/readGcgDeck";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { createSeededRandom } from "genshin-engine";
import { describe, expect, test } from "vitest";

const SEED = 7;
const TUTORIAL_DECK_ID = 1;
const MAX_STEPS = 2000;

// Plays a duel between two decks through the scripted policy each side takes its turns by, until its phase ends or the
// Step limit is reached
const playGcgDuel = (decks: Parameters<typeof createGcgDuel>[0], rule: GcgDuel["rule"]): GcgDuel => {
  const random = createSeededRandom(SEED);
  const duel = createGcgDuel(decks, random, rule);
  for (const sideIndex of [0, 1]) prepareGcgSide(duel, sideIndex, [], 0, random);
  for (let step = 0; step < MAX_STEPS && duel.phase !== GcgPhase.Ended; step++)
    for (const sideIndex of [0, 1]) advanceGcgOpponent(duel, sideIndex, random);
  return duel;
};

describe("a duel between two copies of the tutorial deck", () => {
  test("should be played to its end through the engine's public functions", async () => {
    expect.hasAssertions();

    const tutorialDeck = await readGcgDeck(TUTORIAL_DECK_ID);
    const rule = await readGcgStandardRule();
    const duel = playGcgDuel([tutorialDeck, tutorialDeck], rule);

    expect({ isEnded: duel.phase === GcgPhase.Ended, hasOutcome: duel.outcome !== undefined }).toStrictEqual({
      hasOutcome: true,
      isEnded: true,
    });
  });
});

describe("a duel between opponent decks 3 and 4", () => {
  test("should be played to its end through the engine's public functions", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule();
    const duel = playGcgDuel([await readGcgDeck(3), await readGcgDeck(4)], rule);

    expect({ isEnded: duel.phase === GcgPhase.Ended, hasOutcome: duel.outcome !== undefined }).toStrictEqual({
      hasOutcome: true,
      isEnded: true,
    });
  });
});
