import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { mushroomPizza } from "#src/services/gcg/cards/mushroomPizza";
import { runGcgEndPhase } from "#src/services/gcg/runGcgEndPhase";
import { describe, expect, test } from "vitest";

const MAX_HP = 10;
const WOUNDED_HP = 5;
const TARGET_INDEX = 1;
const LOTUS_FLOWER_CRISP_STATUS_ID = 333_003;

const createSide = (): GcgSideState => ({
  activeIndex: 0,
  cards: [],
  characters: [0, 1].map((id) => ({
    aura: GcgAura.None,
    character: {
      descriptionTextId: 2,
      element: Element.Hydro,
      hp: MAX_HP,
      id,
      maxEnergy: 3,
      nameTextId: 1,
      skills: [],
      weapon: "",
    },
    energy: 0,
    equipments: [],
    hp: id === TARGET_INDEX ? WOUNDED_HP : MAX_HP,
    isFrozen: false,
    shield: 0,
    statuses: [],
  })),
  deckCardIds: [],
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

const createDuel = (side: GcgSideState): GcgDuel => ({
  actingSideIndex: 0,
  firstSideIndex: 0,
  nextFirstSideIndex: 0,
  phase: GcgPhase.Action,
  random: () => 0,
  round: 1,
  rule: { drawCount: 2, handCardLimit: 10, reactions: [] },
  sides: [side, createSide()],
});

describe("mushroomPizza", () => {
  test("should heal the target character for one HP on play", () => {
    expect.hasAssertions();
    const side = createSide();
    const context: GcgEffectContext = { duel: createDuel(side), sideIndex: 0 };
    mushroomPizza.play?.(context, TARGET_INDEX);
    expect(side.characters.map(({ hp }) => hp)).toStrictEqual([MAX_HP, WOUNDED_HP + 1]);
  });

  test("should hold the food for the Round and give the target its In Effect status with two usages on play", () => {
    expect.hasAssertions();
    const side = createSide();
    const context: GcgEffectContext = { duel: createDuel(side), sideIndex: 0 };
    mushroomPizza.play?.(context, TARGET_INDEX);
    expect(side.characters[TARGET_INDEX]?.statuses).toStrictEqual([
      { cardId: 333_007, counter: 0, rounds: 1, usages: 0 },
      { cardId: 303_305, counter: 0, rounds: 0, usages: 2 },
    ]);
  });

  test("should heal the character holding its In Effect status at each End Phase, and spend the status after two", () => {
    expect.hasAssertions();
    const side = createSide();
    const duel = createDuel(side);
    mushroomPizza.play?.({ duel, sideIndex: 0 }, TARGET_INDEX);
    runGcgEndPhase(duel);
    expect({
      hp: side.characters.map(({ hp }) => hp),
      statuses: side.characters[TARGET_INDEX]?.statuses,
    }).toStrictEqual({
      hp: [MAX_HP, WOUNDED_HP + 2],
      statuses: [{ cardId: 303_305, counter: 0, rounds: 0, usages: 1 }],
    });
    runGcgEndPhase(duel);
    expect({
      hp: side.characters.map(({ hp }) => hp),
      statuses: side.characters[TARGET_INDEX]?.statuses,
    }).toStrictEqual({ hp: [MAX_HP, WOUNDED_HP + 3], statuses: [] });
  });

  test("should not be played on a character that already holds food this Round", () => {
    expect.hasAssertions();
    const side = createSide();
    side.characters[TARGET_INDEX]?.statuses.push({
      cardId: LOTUS_FLOWER_CRISP_STATUS_ID,
      counter: 0,
      rounds: 1,
      usages: 1,
    });
    expect(mushroomPizza.canPlay?.({ duel: createDuel(side), sideIndex: 0 }, TARGET_INDEX)).toBe(false);
  });

  test("should be played on a character that holds no food this Round", () => {
    expect.hasAssertions();
    const side = createSide();
    expect(mushroomPizza.canPlay?.({ duel: createDuel(side), sideIndex: 0 }, TARGET_INDEX)).toBe(true);
  });
});
