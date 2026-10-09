import type { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { Element } from "#src/models/Element";
import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { createGcgDuel } from "#src/services/gcg/createGcgDuel";
import { playGcgCard } from "#src/services/gcg/playGcgCard";
import { prepareGcgSide } from "#src/services/gcg/prepareGcgSide";
import { readGcgDeck } from "#src/services/gcg/readGcgDeck";
import { rerollGcgDice } from "#src/services/gcg/rerollGcgDice";
import { switchGcgCharacter } from "#src/services/gcg/switchGcgCharacter";
import { useGcgSkill } from "#src/services/gcg/useGcgSkill";
import { takeOne } from "@esposter/shared";
import { createSeededRandom } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe("the tutorial deck's cards and skills", () => {
  const SEED = 11;
  const TUTORIAL_DECK_ID = 1;
  const CRIMSON_WITCH_OF_FLAMES_HAND_INDEX = 0;
  // The tutorial deck's characters: Diluc, Bennett and Mona, in the order the deck fields them
  const DILUC_INDEX = 0;
  const BENNETT_INDEX = 1;
  const MONA_INDEX = 2;

  // A duel of two copies of the tutorial deck, both sides prepared and rolled, with the first side acting and the given dice
  // On its side
  const openTutorialDuel = async (dice: (Element | GcgDieFace)[]): Promise<GcgDuel> => {
    const random = createSeededRandom(SEED);
    const deck = await readGcgDeck(TUTORIAL_DECK_ID);
    const { gcgStandardRuleSchema } = await import("#src/models/gcg/gcgStandardRuleSchema");
    const { default: standardRule } = await import("#src/generated/gcg/standardRule.json");
    const duel = createGcgDuel([deck, deck], random, gcgStandardRuleSchema.parse(standardRule));
    for (const sideIndex of [0, 1]) prepareGcgSide(duel, sideIndex, [], 0, random);
    for (const sideIndex of [0, 1]) rerollGcgDice(duel, sideIndex, [], random);
    takeOne(duel.sides, 0).dice = dice;
    return duel;
  };

  test("should let Dawn deal 8 Pyro DMG for its four dice and three energy, and give Diluc Pyro Infusion", async () => {
    expect.hasAssertions();

    const pyroDice = [Element.Pyro, Element.Pyro, Element.Pyro, Element.Pyro];
    const duel = await openTutorialDuel(pyroDice);
    takeOne(takeOne(duel.sides, 0).characters, DILUC_INDEX).energy = 3;
    const result = useGcgSkill(duel, 0, 13_013, [0, 1, 2, 3]);

    expect({
      defenderHp: takeOne(takeOne(duel.sides, 1).characters, DILUC_INDEX).hp,
      infusions: takeOne(takeOne(duel.sides, 0).characters, DILUC_INDEX).statuses.map(({ cardId }) => cardId),
      result,
    }).toStrictEqual({ defenderHp: 2, infusions: [113_011], result: GcgActionResult.Done });
  });

  test("should let Crimson Witch of Flames be equipped and spend one Pyro die less on a skill, once a round", async () => {
    expect.hasAssertions();

    const duel = await openTutorialDuel(Array.from({ length: 6 }, () => Element.Pyro));
    takeOne(duel.sides, 0).hand = [312_302, ...takeOne(duel.sides, 0).hand.slice(1)];
    const played = playGcgCard(duel, 0, CRIMSON_WITCH_OF_FLAMES_HAND_INDEX, DILUC_INDEX, [0, 1]);
    const equipmentIds = takeOne(takeOne(duel.sides, 0).characters, DILUC_INDEX).equipments.map(({ cardId }) => cardId);
    const skillResult = useGcgSkill(duel, 0, 13_012, [0, 1]);
    duel.actingSideIndex = 0;
    const secondSkillResult = useGcgSkill(duel, 0, 13_012, [0, 1]);

    expect({ equipmentIds, played, secondSkillResult, skillResult }).toStrictEqual({
      equipmentIds: [312_302],
      played: GcgActionResult.Done,
      secondSkillResult: GcgActionResult.Unpayable,
      skillResult: GcgActionResult.Done,
    });
  });

  test("should let Fantastic Voyage deal 2 Pyro DMG for its four dice and two energy, then leave an Inspiration Field", async () => {
    expect.hasAssertions();

    const duel = await openTutorialDuel(Array.from({ length: 4 }, () => Element.Pyro));
    takeOne(duel.sides[0].characters, BENNETT_INDEX).energy = 2;
    duel.sides[0].activeIndex = BENNETT_INDEX;
    const result = useGcgSkill(duel, 0, 13_033, [0, 1, 2, 3]);

    expect({
      defenderHp: takeOne(duel.sides[1].characters, DILUC_INDEX).hp,
      fields: duel.sides[0].onstages.map(({ cardId }) => cardId),
      result,
    }).toStrictEqual({ defenderHp: 8, fields: [113_031], result: GcgActionResult.Done });
  });

  test("should make the first switch away from Mona in a round a fast action", async () => {
    expect.hasAssertions();

    const duel = await openTutorialDuel([Element.Hydro, Element.Hydro, Element.Hydro]);
    takeOne(duel.sides, 0).activeIndex = MONA_INDEX;
    const fastResult = switchGcgCharacter(duel, 0, 0, [0]);
    const actingAfterFast = duel.actingSideIndex;
    takeOne(duel.sides, 0).activeIndex = MONA_INDEX;
    takeOne(duel.sides, 0).dice = [Element.Hydro];
    const combatResult = switchGcgCharacter(duel, 0, 1, [0]);

    expect({ actingAfterCombat: duel.actingSideIndex, actingAfterFast, combatResult, fastResult }).toStrictEqual({
      actingAfterCombat: 1,
      actingAfterFast: 0,
      combatResult: GcgActionResult.Done,
      fastResult: GcgActionResult.Done,
    });
  });
});
