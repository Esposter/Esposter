import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { Element } from "#src/models/Element";
import { applyGcgDamage } from "#src/services/gcg/applyGcgDamage";
import { createGcgDuel } from "#src/services/gcg/createGcgDuel";
import { prepareGcgSide } from "#src/services/gcg/prepareGcgSide";
import { readGcgDeck } from "#src/services/gcg/readGcgDeck";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { rerollGcgDice } from "#src/services/gcg/rerollGcgDice";
import { takeOne } from "@esposter/shared";
import { createSeededRandom } from "genshin-engine";
import { describe, expect, test } from "vitest";

const SEED = 4;
const MONSTER_DECK_ID = 11_002;
const TUTORIAL_DECK_ID = 1;
// Electro Slime is the monster deck's last character, the one that holds Elemental Lifeform: Electro from the battle's start
const ELECTRO_SLIME_INDEX = 2;

describe("the Electro Slime's Elemental Lifeform", () => {
  test("should have Electro applied from the battle's start, and take no Electro DMG", async () => {
    expect.hasAssertions();

    const random = createSeededRandom(SEED);
    const duel: GcgDuel = createGcgDuel(
      [await readGcgDeck(MONSTER_DECK_ID), await readGcgDeck(TUTORIAL_DECK_ID)],
      random,
      await readGcgStandardRule(),
    );
    for (const sideIndex of [0, 1]) prepareGcgSide(duel, sideIndex, [], 0, random);
    for (const sideIndex of [0, 1]) rerollGcgDice(duel, sideIndex, [], random);
    takeOne(duel.sides, 0).activeIndex = ELECTRO_SLIME_INDEX;
    const slime = takeOne(takeOne(duel.sides, 0).characters, ELECTRO_SLIME_INDEX);
    const startingAura = slime.aura;
    applyGcgDamage(duel, 1, { damageType: Element.Electro, value: 2 }, duel.rule);

    expect({ aura: startingAura, hp: slime.hp }).toStrictEqual({ aura: Element.Electro, hp: slime.character.hp });
  });
});
