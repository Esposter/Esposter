import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";

import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { lotusFlowerCrisp } from "#src/services/gcg/cards/lotusFlowerCrisp";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const FULL_HP = 10;

const createCharacterState = (id: number): GcgCharacterState => ({
  aura: GcgAura.None,
  character: {
    descriptionTextId: 2,
    element: Element.Hydro,
    hp: FULL_HP,
    id,
    maxEnergy: 3,
    nameTextId: 1,
    skills: [],
    weapon: "",
  },
  energy: 0,
  equipments: [],
  hp: FULL_HP,
  isFrozen: false,
  shield: 0,
  statuses: [],
});

const createSide = (sideCharacters: GcgCharacterState[]) => ({
  activeIndex: 0,
  cards: [],
  characters: sideCharacters,
  dice: [],
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
  actingSideIndex: 0,
  firstSideIndex: 0,
  nextFirstSideIndex: 0,
  outcome: undefined,
  phase: GcgPhase.Action,
  round: 1,
  rule: { handCardLimit: 10 } as GcgDuel["rule"],
  sides: [createSide(characters), createSide([])],
  winnerSideIndex: undefined,
});

describe("lotus Flower Crisp", () => {
  test("the target takes 3 less DMG the next time, and eats no other food that round", () => {
    expect.hasAssertions();
    const duel = createDuel([createCharacterState(1), createCharacterState(2)]);
    const context: GcgEffectContext = { duel, sideIndex: 0 };
    expect(lotusFlowerCrisp.canPlay?.(context, 1)).toBe(true);
    lotusFlowerCrisp.play?.(context, 1);
    const statuses = takeOne(takeOne(duel.sides, 0).characters, 1).statuses;
    expect(statuses.map(({ cardId }) => cardId)).toStrictEqual([333_003]);
    expect(lotusFlowerCrisp.canPlay?.(context, 1)).toBe(false);
    expect(lotusFlowerCrisp.modifyDamageReceived?.(context, 5, takeOne(statuses, 0))).toBe(2);
    expect(takeOne(statuses, 0).usages).toBe(0);
  });
});
