import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";

import { Element } from "#src/models/Element";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { lotusFlowerCrisp } from "#src/services/gcg/cards/lotusFlowerCrisp";
import { teyvatFriedEgg } from "#src/services/gcg/cards/teyvatFriedEgg";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";

const createSide = (sideCharacters: GcgCharacterState[]) => ({
  activeIndex: 0,
  cards: [],
  characters: sideCharacters,
  dice: [],
  deckCardIds: [],
  drawPile: [],
  hand: [],
  hasDeclaredEnd: false,
  hasPrepared: true,
  hasRolled: true,
  isReplacementPending: false,
  onstages: [],
  summons: [],
  supports: [],
  usedCardIds: [],
  usedSkillIds: [],
});

// A duel of two sides, the first with the given characters, the round in progress
const createDuel = (characters: GcgCharacterState[]): GcgDuel => ({
  cardModules: GcgCardIdModuleMap,
  skillModules: GcgEffectNameSkillModuleMap,
  actingSideIndex: 0,
  firstSideIndex: 0,
  nextFirstSideIndex: 0,
  outcome: undefined,
  phase: GcgPhase.Action,
  random: () => 0,
  round: 1,
  rule: { handCardLimit: 10 } as GcgDuel["rule"],
  sides: [createSide(characters), createSide([])],
  winnerSideIndex: undefined,
});

describe("lotus Flower Crisp", () => {
  test("the target takes 3 less DMG the next time, and eats no other food that round", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createGcgCharacterState({ character: { id: 1 } }),
      createGcgCharacterState({ character: { id: 2 } }),
    ]);
    const context: GcgEffectContext = { duel, sideIndex: 0 };
    expect(lotusFlowerCrisp.canPlay?.(context, 1)).toBe(true);
    lotusFlowerCrisp.play?.(context, 1);
    const statuses = takeOne(takeOne(duel.sides, 0).characters, 1).statuses;
    expect(statuses.map(({ cardId }) => cardId)).toStrictEqual([333_003]);
    expect(lotusFlowerCrisp.canPlay?.(context, 1)).toBe(false);
    expect(lotusFlowerCrisp.modifyDamageReceived?.(context, 5, takeOne(statuses, 0), Element.Pyro)).toBe(2);
    expect(takeOne(statuses, 0).usages).toBe(0);
  });
});

describe("teyvat Fried Egg", () => {
  test("a defeated character is revived to 1 HP and healed 1 HP, and holds the food for the round", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createGcgCharacterState({ character: { id: 1 } }),
      createGcgCharacterState({ character: { id: 2 }, hp: 0 }),
    ]);
    const context: GcgEffectContext = { duel, sideIndex: 0 };
    expect(teyvatFriedEgg.canPlay?.(context, 1)).toBe(true);
    teyvatFriedEgg.play?.(context, 1);
    const side = takeOne(duel.sides, 0);
    expect({
      hp: takeOne(side.characters, 1).hp,
      statuses: takeOne(side.characters, 1).statuses.map(({ cardId }) => cardId),
      usedCardIds: side.usedCardIds,
    }).toStrictEqual({ hp: 2, statuses: [333_009], usedCardIds: [333_009] });
  });

  test("only one character is revived a round, and a standing character cannot be the target", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createGcgCharacterState({ character: { id: 1 } }),
      createGcgCharacterState({ character: { id: 2 }, hp: 0 }),
      createGcgCharacterState({ character: { id: 3 }, hp: 0 }),
    ]);
    const context: GcgEffectContext = { duel, sideIndex: 0 };
    teyvatFriedEgg.play?.(context, 1);
    expect([teyvatFriedEgg.canPlay?.(context, 2), teyvatFriedEgg.canPlay?.(context, 0)]).toStrictEqual([false, false]);
  });
});
