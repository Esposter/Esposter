import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { advanceGcgOpponent } from "#src/services/gcg/advanceGcgOpponent";
import { createGcgDuel } from "#src/services/gcg/createGcgDuel";
import { prepareGcgSide } from "#src/services/gcg/prepareGcgSide";
import { readGcgDeck } from "#src/services/gcg/readGcgDeck";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { createSeededRandom } from "genshin-engine";
import { describe, expect, test } from "vitest";

// Plays a duel between two decks through the scripted policy each side takes its turns by, until its phase ends or the
// Step limit is reached
const playGcgDuel = (decks: Parameters<typeof createGcgDuel>[0], rule: GcgDuel["rule"]): GcgDuel => {
  const SEED = 7;
  const MAX_STEPS = 2000;
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

    const tutorialDeck = await readGcgDeck(1);
    const rule = await readGcgStandardRule();
    const duel = playGcgDuel([tutorialDeck, tutorialDeck], rule);

    expect({ hasOutcome: duel.outcome !== undefined, isEnded: duel.phase === GcgPhase.Ended }).toStrictEqual({
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

    expect({ hasOutcome: duel.outcome !== undefined, isEnded: duel.phase === GcgPhase.Ended }).toStrictEqual({
      hasOutcome: true,
      isEnded: true,
    });
  });
});

describe("the tutorial duels' decks: the player's deck 7 and the opponent decks 30111 and 30112", () => {
  test("should play opponent deck 30111 against opponent deck 30112 to its end", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule();
    const duel = playGcgDuel([await readGcgDeck(30_111), await readGcgDeck(30_112)], rule);

    expect({ hasOutcome: duel.outcome !== undefined, isEnded: duel.phase === GcgPhase.Ended }).toStrictEqual({
      hasOutcome: true,
      isEnded: true,
    });
  });

  test("should play the player's deck 7 against opponent deck 30111 to its end", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule();
    const duel = playGcgDuel([await readGcgDeck(7), await readGcgDeck(30_111)], rule);

    expect({ hasOutcome: duel.outcome !== undefined, isEnded: duel.phase === GcgPhase.Ended }).toStrictEqual({
      hasOutcome: true,
      isEnded: true,
    });
  });
});

describe("the Oceanid duel's deck 2", () => {
  test("should be played against the tutorial deck to its end", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule();
    const duel = playGcgDuel([await readGcgDeck(1), await readGcgDeck(2)], rule);

    expect({ hasOutcome: duel.outcome !== undefined, isEnded: duel.phase === GcgPhase.Ended }).toStrictEqual({
      hasOutcome: true,
      isEnded: true,
    });
  });
});

describe("the Mondstadt challenger Marjorie's deck 11005", () => {
  test("should be played against the tutorial deck to its end", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule();
    const duel = playGcgDuel([await readGcgDeck(1), await readGcgDeck(11_005)], rule);

    expect({ hasOutcome: duel.outcome !== undefined, isEnded: duel.phase === GcgPhase.Ended }).toStrictEqual({
      hasOutcome: true,
      isEnded: true,
    });
  });
});

describe("the Mondstadt challenger Ellin's monster deck 11002", () => {
  test("should be played against the tutorial deck to its end", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule();
    const duel = playGcgDuel([await readGcgDeck(1), await readGcgDeck(11_002)], rule);

    expect({ hasOutcome: duel.outcome !== undefined, isEnded: duel.phase === GcgPhase.Ended }).toStrictEqual({
      hasOutcome: true,
      isEnded: true,
    });
  });
});
