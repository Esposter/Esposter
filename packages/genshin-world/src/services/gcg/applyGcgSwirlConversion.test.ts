import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { Element } from "#src/models/Element";
import { applyGcgDamage } from "#src/services/gcg/applyGcgDamage";
import { largeWindSpirit } from "#src/services/gcg/cards/largeWindSpirit";
import { createGcgDuel } from "#src/services/gcg/createGcgDuel";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { prepareGcgSide } from "#src/services/gcg/prepareGcgSide";
import { readGcgDeck } from "#src/services/gcg/readGcgDeck";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { rerollGcgDice } from "#src/services/gcg/rerollGcgDice";
import { takeOne } from "@esposter/shared";
import { createSeededRandom } from "genshin-engine";
import { describe, expect, test } from "vitest";

const SEED = 6;
const TUTORIAL_DECK_ID = 1;
const LARGE_WIND_SPIRIT_ID = 115_011;

const openDuel = async (): Promise<GcgDuel> => {
  const random = createSeededRandom(SEED);
  const deck = await readGcgDeck(TUTORIAL_DECK_ID);
  const duel = createGcgDuel([deck, deck], random, await readGcgStandardRule());
  for (const sideIndex of [0, 1]) prepareGcgSide(duel, sideIndex, [], 0, random);
  for (const sideIndex of [0, 1]) rerollGcgDice(duel, sideIndex, [], random);
  return duel;
};

describe("the Large Wind Spirit's Swirl conversion", () => {
  test("should convert to the Swirled element on the first Swirl its side makes, and not again", async () => {
    expect.hasAssertions();

    const duel = await openDuel();
    takeOne(duel.sides, 0).summons.push(createGcgZoneCard(LARGE_WIND_SPIRIT_ID, largeWindSpirit));
    const defender = takeOne(takeOne(duel.sides, 1).characters, takeOne(duel.sides, 1).activeIndex);
    defender.aura = Element.Pyro;
    applyGcgDamage(duel, 0, { damageType: Element.Anemo, value: 1 }, duel.rule);
    const convertedElement = takeOne(duel.sides, 0).summons[0]?.element;
    defender.aura = Element.Hydro;
    applyGcgDamage(duel, 0, { damageType: Element.Anemo, value: 1 }, duel.rule);

    expect({ convertedElement, elementAfterSecondSwirl: takeOne(duel.sides, 0).summons[0]?.element }).toStrictEqual({
      convertedElement: Element.Pyro,
      elementAfterSecondSwirl: Element.Pyro,
    });
  });
});
