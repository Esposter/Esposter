import type { GcgDeck } from "#src/models/gcg/GcgDeck";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { createGcgDuel } from "#src/services/gcg/createGcgDuel";
import { prepareGcgSide } from "#src/services/gcg/prepareGcgSide";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { takeOne } from "@esposter/shared";
import { createSeededRandom } from "genshin-engine";
import { describe, expect, test } from "vitest";

const TEST_RULE = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);

describe(prepareGcgSide, () => {
  const SEED = 3;
  const CARD_COUNT = 12;
  const STARTING_HAND_COUNT = 5;
  const deck: GcgDeck = {
    cardIds: Array.from({ length: CARD_COUNT }, (_value, index) => index + 1),
    cards: [],
    characters: [
      {
        descriptionTextId: 2,
        element: Element.Pyro,
        hp: 10,
        id: 1,
        maxEnergy: 3,
        nameTextId: 1,
        skills: [],
        weapon: "",
      },
      {
        descriptionTextId: 2,
        element: Element.Hydro,
        hp: 10,
        id: 2,
        maxEnergy: 3,
        nameTextId: 1,
        skills: [],
        weapon: "",
      },
    ],
  };

  test("should deal each side a starting hand from its shuffled cards, and keep the hand's size when a card is switched", () => {
    expect.hasAssertions();

    const duel = createGcgDuel([deck, deck], createSeededRandom(SEED), TEST_RULE);
    const result = prepareGcgSide(duel, 0, [0], 1, createSeededRandom(SEED));

    expect({
      drawPileSize: takeOne(duel.sides, 0).drawPile.length,
      handSize: takeOne(duel.sides, 0).hand.length,
      result,
    }).toStrictEqual({
      drawPileSize: CARD_COUNT - STARTING_HAND_COUNT,
      handSize: STARTING_HAND_COUNT,
      result: GcgActionResult.Done,
    });
  });

  test("should open the first round's roll once both sides have prepared", () => {
    expect.hasAssertions();

    const duel = createGcgDuel([deck, deck], createSeededRandom(SEED), TEST_RULE);
    prepareGcgSide(duel, 0, [], 0, createSeededRandom(SEED));
    const phaseAfterFirstSide = duel.phase;
    prepareGcgSide(duel, 1, [], 0, createSeededRandom(SEED));

    expect({
      diceCounts: duel.sides.map(({ dice }) => dice.length),
      phase: duel.phase,
      phaseAfterFirstSide,
    }).toStrictEqual({ diceCounts: [8, 8], phase: GcgPhase.Roll, phaseAfterFirstSide: GcgPhase.Preparation });
  });
});
