import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { applyGcgDamage } from "#src/services/gcg/applyGcgDamage";
import { cuileinAnbar } from "#src/services/gcg/cards/cuileinAnbar";
import { gamblersEarrings } from "#src/services/gcg/cards/gamblersEarrings";
import { instructorsCap } from "#src/services/gcg/cards/instructorsCap";
import { liben } from "#src/services/gcg/cards/liben";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { runGcgActionPhase } from "#src/services/gcg/runGcgActionPhase";
import { runGcgEndPhase } from "#src/services/gcg/runGcgEndPhase";
import { runGcgSkillUse } from "#src/services/gcg/runGcgSkillUse";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const FULL_HP = 10;
const COLLEI_ID = 1701;
const LIBEN_ID = 322_008;
const KEQING_ID = 1403;
const OTHER_CHARACTER_ID = 1401;
const OPPOSING_CHARACTER_ID = 1203;
const CUILEIN_ANBAR_ID = 117_011;
const TEST_RULE = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);
const TRUMP_CARD_KITTY_SKILL: GcgSkill = {
  costs: [],
  effect: "Char_Skill_17013",
  energyGain: 0,
  id: 17_013,
  kind: GcgSkillKind.ElementalBurst,
};

const STARWARD_SWORD_SKILL: GcgSkill = {
  costs: [],
  effect: "Char_Skill_14033",
  energyGain: 0,
  id: 14_033,
  kind: GcgSkillKind.ElementalBurst,
};

const FLORAL_BRUSH_SKILL: GcgSkill = {
  costs: [],
  effect: "Char_Skill_17012",
  energyGain: 1,
  id: 17_012,
  kind: GcgSkillKind.ElementalSkill,
};

const createCharacterState = (id: number): GcgCharacterState => ({
  aura: GcgAura.None,
  character: {
    descriptionTextId: 2,
    element: Element.Dendro,
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

const createSideState = (characters: GcgCharacterState[]): GcgSideState => ({
  activeIndex: 0,
  cards: [],
  characters,
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

const createDuel = (sides: [GcgSideState, GcgSideState]): GcgDuel => ({
  actingSideIndex: 0,
  firstSideIndex: 0,
  nextFirstSideIndex: 0,
  outcome: undefined,
  phase: GcgPhase.Action,
  random: () => 0,
  round: 1,
  rule: TEST_RULE,
  sides,
  winnerSideIndex: undefined,
});

describe("cuilein-Anbar", () => {
  test("the end phase deals 2 Dendro to the opposing active character, and spends a usage", () => {
    expect.hasAssertions();
    const zoneCard = createGcgZoneCard(CUILEIN_ANBAR_ID, cuileinAnbar);
    const duel = createDuel([
      createSideState([createCharacterState(COLLEI_ID)]),
      createSideState([createCharacterState(OPPOSING_CHARACTER_ID), createCharacterState(COLLEI_ID)]),
    ]);
    duel.sides[0] = { ...takeOne(duel.sides, 0), summons: [zoneCard] };
    runGcgEndPhase(duel);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([FULL_HP - 2, FULL_HP]);
    expect(zoneCard.usages).toBe(1);
  });
});

describe("floral Brush", () => {
  test("the skill deals 3 Dendro", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(COLLEI_ID)]),
      createSideState([createCharacterState(OPPOSING_CHARACTER_ID)]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, FLORAL_BRUSH_SKILL);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([FULL_HP - 3]);
  });
});

describe("gambler's Earrings", () => {
  const createEquippedCollei = (): GcgCharacterState => ({
    ...createCharacterState(COLLEI_ID),
    equipments: [createGcgZoneCard(312_004, gamblersEarrings)],
  });

  test("after an opposing character is defeated while the equipped character is active, two Omni dice are created", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createEquippedCollei()]),
      createSideState([{ ...createCharacterState(OPPOSING_CHARACTER_ID), hp: 3 }, createCharacterState(KEQING_ID)]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, FLORAL_BRUSH_SKILL);
    expect(takeOne(duel.sides, 0).dice).toStrictEqual([GcgDieFace.Omni, GcgDieFace.Omni]);
  });

  test("a defeat while the equipped character is not active creates no die", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(OTHER_CHARACTER_ID), createEquippedCollei()]),
      createSideState([{ ...createCharacterState(OPPOSING_CHARACTER_ID), hp: 3 }, createCharacterState(KEQING_ID)]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, FLORAL_BRUSH_SKILL);
    expect(takeOne(duel.sides, 0).dice).toStrictEqual([]);
  });

  test("it creates dice at most three times in a match", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createEquippedCollei()]),
      createSideState(Array.from({ length: 5 }, () => ({ ...createCharacterState(OPPOSING_CHARACTER_ID), hp: 1 }))),
    ]);
    for (let defeated = 0; defeated < 4; defeated++) {
      takeOne(duel.sides, 1).activeIndex = defeated;
      applyGcgDamage(duel, 0, { damageType: Element.Dendro, value: 1 }, TEST_RULE);
    }
    expect(takeOne(duel.sides, 0).dice).toStrictEqual(Array.from({ length: 6 }, () => GcgDieFace.Omni));
  });
});

describe("instructor's Cap", () => {
  const createEquippedCollei = (): GcgCharacterState => ({
    ...createCharacterState(COLLEI_ID),
    equipments: [createGcgZoneCard(312_005, instructorsCap)],
  });

  test("after the equipped character's skill triggers a reaction, an Elemental Die of its element is created", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createEquippedCollei()]),
      createSideState([{ ...createCharacterState(OPPOSING_CHARACTER_ID), aura: Element.Pyro }]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, FLORAL_BRUSH_SKILL);
    expect(takeOne(duel.sides, 0).dice).toStrictEqual([Element.Dendro]);
  });

  test("a skill that triggers no reaction creates no die", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createEquippedCollei()]),
      createSideState([createCharacterState(OPPOSING_CHARACTER_ID)]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, FLORAL_BRUSH_SKILL);
    expect(takeOne(duel.sides, 0).dice).toStrictEqual([]);
  });

  test("creates at most three Elemental Dice a round", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createEquippedCollei()]),
      createSideState([{ ...createCharacterState(OPPOSING_CHARACTER_ID), hp: FULL_HP * 10 }]),
    ]);
    for (let use = 0; use < 4; use++) {
      takeOne(duel.sides, 1).characters[0].aura = Element.Pyro;
      runGcgSkillUse({ duel, sideIndex: 0 }, FLORAL_BRUSH_SKILL);
    }
    expect(takeOne(duel.sides, 0).dice).toStrictEqual([Element.Dendro, Element.Dendro, Element.Dendro]);
  });
});

describe("starward Sword", () => {
  test("the burst deals 4 Electro to the opposing active character and 3 Piercing to each one on standby", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(KEQING_ID)]),
      createSideState([createCharacterState(OPPOSING_CHARACTER_ID), createCharacterState(COLLEI_ID)]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, STARWARD_SWORD_SKILL);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([FULL_HP - 4, FULL_HP - 3]);
  });
});

describe("trump-Card Kitty", () => {
  test("the burst deals 2 Dendro, and summons a Cuilein-Anbar on its side", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(COLLEI_ID)]),
      createSideState([createCharacterState(OPPOSING_CHARACTER_ID)]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, TRUMP_CARD_KITTY_SKILL);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([FULL_HP - 2]);
    expect(takeOne(duel.sides, 0).summons.map(({ cardId }) => cardId)).toStrictEqual([CUILEIN_ANBAR_ID]);
  });
});

describe("liben", () => {
  test("the end phase collects one unused Elemental Die of each type, and leaves the rest in the dice", () => {
    expect.hasAssertions();
    const zoneCard = createGcgZoneCard(LIBEN_ID, liben);
    const duel = createDuel([
      {
        ...createSideState([createCharacterState(COLLEI_ID)]),
        dice: [Element.Pyro, Element.Pyro, Element.Hydro, GcgDieFace.Omni],
        supports: [zoneCard],
      },
      createSideState([createCharacterState(OPPOSING_CHARACTER_ID)]),
    ]);
    runGcgEndPhase(duel);
    expect(takeOne(duel.sides, 0).dice).toStrictEqual([Element.Pyro, GcgDieFace.Omni]);
    expect(zoneCard.elements).toStrictEqual([Element.Pyro, Element.Hydro]);
    expect(zoneCard.usages).toBe(1);
  });

  test("with three dice collected, the action phase draws two cards, creates two Omni dice, and discards it", () => {
    expect.hasAssertions();
    const zoneCard = createGcgZoneCard(LIBEN_ID, liben);
    zoneCard.elements = [Element.Pyro, Element.Hydro, Element.Cryo];
    const duel = createDuel([
      { ...createSideState([createCharacterState(COLLEI_ID)]), drawPile: [1, 2, 3], supports: [zoneCard] },
      createSideState([createCharacterState(OPPOSING_CHARACTER_ID)]),
    ]);
    runGcgActionPhase(duel);
    const side = takeOne(duel.sides, 0);
    expect(side.hand).toStrictEqual([1, 2]);
    expect(side.dice).toStrictEqual([GcgDieFace.Omni, GcgDieFace.Omni]);
    expect(side.supports).toStrictEqual([]);
  });

  test("with fewer than three Elemental Dice collected, the action phase keeps it on the field", () => {
    expect.hasAssertions();
    const zoneCard = createGcgZoneCard(LIBEN_ID, liben);
    zoneCard.elements = [Element.Pyro, Element.Hydro];
    const duel = createDuel([
      { ...createSideState([createCharacterState(COLLEI_ID)]), drawPile: [1, 2, 3], supports: [zoneCard] },
      createSideState([createCharacterState(OPPOSING_CHARACTER_ID)]),
    ]);
    runGcgActionPhase(duel);
    const side = takeOne(duel.sides, 0);
    expect(side.supports).toStrictEqual([zoneCard]);
    expect(side.hand).toStrictEqual([]);
    expect(side.dice).toStrictEqual([]);
  });
});
