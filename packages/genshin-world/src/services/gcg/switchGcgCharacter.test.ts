import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { Element } from "#src/models/Element";
import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { dawnWinery } from "#src/services/gcg/cards/dawnWinery";
import { icicle } from "#src/services/gcg/cards/icicle";
import { leaveItToMe } from "#src/services/gcg/cards/leaveItToMe";
import { createGcgDuel } from "#src/services/gcg/createGcgDuel";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { prepareGcgSide } from "#src/services/gcg/prepareGcgSide";
import { readGcgDeck } from "#src/services/gcg/readGcgDeck";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { rerollGcgDice } from "#src/services/gcg/rerollGcgDice";
import { switchGcgCharacter } from "#src/services/gcg/switchGcgCharacter";
import { takeOne } from "@esposter/shared";
import { createSeededRandom } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe("switching characters under the field's cards", () => {
  const SEED = 5;
  const PLAYER_DECK_ID = 7;
  const DILUC_INDEX = 0;
  const KAEYA_INDEX = 1;
  const DAWN_WINERY_ID = 321_004;
  const ICICLE_ID = 111_031;
  const LEAVE_IT_TO_ME_ID = 332_006;

  // A duel of two copies of the player's deck, both sides prepared and rolled, with the first side to act holding the given dice
  const openDuel = async (dice: Element[]): Promise<GcgDuel> => {
    const random = createSeededRandom(SEED);
    const deck = await readGcgDeck(PLAYER_DECK_ID);
    const duel = createGcgDuel([deck, deck], random, await readGcgStandardRule());
    for (const sideIndex of [0, 1]) prepareGcgSide(duel, sideIndex, [], 0, random);
    for (const sideIndex of [0, 1]) rerollGcgDice(duel, sideIndex, [], random);
    takeOne(duel.sides, 0).dice = dice;
    return duel;
  };

  test("should let a switch cost no die under Dawn Winery, and Icicle deal 2 Cryo DMG after it", async () => {
    expect.hasAssertions();

    const duel = await openDuel([]);
    takeOne(duel.sides, 0).activeIndex = DILUC_INDEX;
    takeOne(duel.sides, 0).supports.push(createGcgZoneCard(DAWN_WINERY_ID, dawnWinery));
    takeOne(duel.sides, 0).onstages.push(createGcgZoneCard(ICICLE_ID, icicle));
    const result = switchGcgCharacter(duel, 0, KAEYA_INDEX, []);

    expect({
      actingSideIndex: duel.actingSideIndex,
      activeIndex: takeOne(duel.sides, 0).activeIndex,
      defenderHp: takeOne(takeOne(duel.sides, 1).characters, DILUC_INDEX).hp,
      icicleUsages: takeOne(duel.sides, 0).onstages.map(({ usages }) => usages),
      result,
    }).toStrictEqual({
      actingSideIndex: 1,
      activeIndex: KAEYA_INDEX,
      defenderHp: 8,
      icicleUsages: [2],
      result: GcgActionResult.Done,
    });
  });

  test("should make the next switch a fast action under Leave It to Me!, for one usage", async () => {
    expect.hasAssertions();

    const duel = await openDuel([Element.Pyro]);
    takeOne(duel.sides, 0).onstages.push(createGcgZoneCard(LEAVE_IT_TO_ME_ID, leaveItToMe));
    const result = switchGcgCharacter(duel, 0, KAEYA_INDEX, [0]);

    expect({
      actingSideIndex: duel.actingSideIndex,
      onstages: takeOne(duel.sides, 0).onstages.length,
      result,
    }).toStrictEqual({ actingSideIndex: 0, onstages: 0, result: GcgActionResult.Done });
  });
});
